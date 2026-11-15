import "dotenv/config";
import express, { Request, Response, NextFunction } from "express";
import z, { object, string } from "zod";
import bcrypt from "bcrypt";
import { PrismaClient, Prisma } from "./generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import jwt from "jsonwebtoken";
import { auth } from "./auth/auth";
import { AppError } from "./AppError";
import cors from "cors";
import { randomBytes } from "node:crypto";

const secret = process.env.JWT_SECRET ?? "";
const isProduction = process.env.NODE_ENV === "production" || process.env.VERCEL_ENV === "production";
if (!secret || (isProduction && Buffer.byteLength(secret, "utf8") < 32)) {
  throw new Error("JWT_SECRET must be configured with at least 32 random bytes in production");
}

const databaseUrl = process.env.DATABASE_URL?.trim();
if (!databaseUrl) throw new Error("DATABASE_URL must be configured");

const configuredOrigins = process.env.FRONTEND_ORIGINS;
if (isProduction && !configuredOrigins?.trim()) {
  throw new Error("Set FRONTEND_ORIGINS to the frontend's HTTPS origin (for example https://your-app.vercel.app), without a path, query, or fragment");
}
const originValues = (configuredOrigins ?? "http://localhost:5173,http://localhost:5174")
  .split(",").map((origin) => origin.trim()).filter(Boolean);
const frontendOrigins = originValues.map((origin) => {
  try {
    const parsed = new URL(origin);
    if (parsed.username || parsed.password || parsed.pathname !== "/" || parsed.search || parsed.hash || (isProduction && parsed.protocol !== "https:")) {
      throw new Error();
    }
    return parsed.origin;
  } catch {
    throw new Error("FRONTEND_ORIGINS must contain only origins (scheme and host), using HTTPS in production; remove paths, queries, and fragments");
  }
});
if (isProduction && frontendOrigins.length === 0) {
  throw new Error("Set FRONTEND_ORIGINS to at least one HTTPS frontend origin");
}
const authCookieOptions = {
  httpOnly: true,
  secure: isProduction || process.env.COOKIE_SECURE === "true",
  sameSite: "lax" as const,
  path: "/",
};
const dummyPasswordHash = bcrypt.hash(randomBytes(32).toString("hex"), 12);

const adapter = new PrismaPg({
  connectionString: databaseUrl,
});

export const client = new PrismaClient({
  adapter,
});

const app = express();
if (process.env.TRUST_PROXY) {
  const trustedProxyHops = Number(process.env.TRUST_PROXY);
  if (!Number.isSafeInteger(trustedProxyHops) || trustedProxyHops < 1) {
    throw new Error("TRUST_PROXY must be a positive integer number of trusted proxy hops");
  }
  app.set("trust proxy", trustedProxyHops);
}
app.use(
  cors({
    origin(origin, callback) {
      if (!origin || frontendOrigins.includes(origin)) return callback(null, true);
      return callback(new Error("Origin is not allowed by CORS"));
    },
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  }),
);

app.use((req, res, next) => {
  const hasAuthCookie = req.headers.cookie?.split(";").some((part) => part.trim().startsWith("auth_token="));
  if (hasAuthCookie && ["POST", "PUT", "PATCH", "DELETE"].includes(req.method)) {
    const origin = req.headers.origin;
    if (!origin || !frontendOrigins.includes(origin)) {
      return res.status(403).json({ message: "Request origin is not allowed" });
    }
  }
  next();
});
app.disable("x-powered-by");
app.use((_req, res, next) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("Referrer-Policy", "no-referrer");
  res.setHeader("Cache-Control", "no-store");
  if (isProduction) res.setHeader("Strict-Transport-Security", "max-age=31536000");
  next();
});
app.use(express.json({ limit: "2mb" }));

function rateLimit(windowMs: number, max: number) {
  const buckets = new Map<string, { count: number; resetAt: number }>();
  return (req: Request, res: Response, next: NextFunction) => {
    const now = Date.now();
    const key = `${req.ip ?? "unknown"}:${req.path}`;
    let bucket = buckets.get(key);
    if (!bucket || bucket.resetAt <= now) {
      bucket = { count: 0, resetAt: now + windowMs };
      buckets.set(key, bucket);
    }
    bucket.count += 1;
    if (bucket.count > max) {
      res.setHeader("Retry-After", String(Math.ceil((bucket.resetAt - now) / 1000)));
      return res.status(429).json({ message: "Too many requests. Please try again later." });
    }
    if (buckets.size > 10_000) {
      for (const [bucketKey, value] of buckets) if (value.resetAt <= now) buckets.delete(bucketKey);
    }
    next();
  };
}

app.get("/health", async (_req, res) => {
  try {
    await client.$queryRaw`SELECT 1`;
    res.status(200).json({ status: "ok" });
  } catch {
    res.status(503).json({ status: "unavailable" });
  }
});

app.post("/signup", rateLimit(15 * 60_000, 10), async (req, res, next) => {
  const phoneSchema = z.string().trim().transform((value) => {
    const normalized = value.replace(/[\s()-]/g, "");
    return normalized.startsWith("+91") ? normalized.slice(3) : normalized;
  }).pipe(z.string().regex(/^[0-9]{10}$/));
  const requiredUser = z.object({
    firstName: z.string().trim().min(2).max(80),
    lastName: z.string().trim().min(2).max(80),
    buisnessName: z.string().trim().min(2).max(160),
    email: z.string().trim().toLowerCase().email().max(254),
    phoneNumber: phoneSchema,
    password: z
      .string()
      .min(12)
      .max(72)
      .refine((value) => Buffer.byteLength(value, "utf8") <= 72)
      .regex(/[A-Z]/)
      .regex(/[a-z]/)
      .regex(/[0-9]/)
      .regex(/[^A-Za-z0-9]/),
  }).strict();

  const parsedDataWithSuccess = requiredUser.safeParse(req.body);

  if (!parsedDataWithSuccess.success) {
    return next(new AppError("invalid credentials", 400));
  }
  try {
    const { password, ...userData } = parsedDataWithSuccess.data;
    const hashPassword = await bcrypt.hash(password, 12);

    await client.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: { ...userData, password: hashPassword },
      });
      await tx.biltyCounter.create({
        data: { userId: user.id, lastBiltyNumber: 0 },
      });
    });
    res.status(201).json({
      message: "Account created successfully",
    });
  } catch (err) {
    return next(err);
  }
});
app.post("/signin", rateLimit(15 * 60_000, 10), async (req, res, next) => {
  const signInSchema = z.object({
    email: z.string().trim().toLowerCase().email().max(254),
    password: z.string().min(1).max(72).refine((value) => Buffer.byteLength(value, "utf8") <= 72),
  }).strict();
  const parsed = signInSchema.safeParse(req.body);
  if (!parsed.success) return next(new AppError("Invalid email or password", 401));

  try {
    const user = await client.user.findFirst({
      where: { email: parsed.data.email },
    });

    const targetHash = user ? user.password : await dummyPasswordHash;
    const passwordMatch = await bcrypt.compare(parsed.data.password, targetHash);

    if (user && passwordMatch) {
      const token = jwt.sign(
        {
          id: user.id.toString(),
        },
        secret,
        { algorithm: "HS256", expiresIn: "1h", issuer: "transport-management", audience: "transport-management-web" },
      );

      res.cookie("auth_token", token, { ...authCookieOptions, maxAge: 60 * 60 * 1000 });
      res.status(200).json({ message: "Signed in successfully" });
    } else {
      return next(new AppError("Invalid email or password", 401));
    }
  } catch (err) {
    return next(err);
  }
});
app.post("/signout", (_req, res) => {
  res.clearCookie("auth_token", authCookieOptions);
  res.status(204).end();
});
app.get("/me", auth, async (req, res, next) => {
  const userId = req.userId;
  if (!userId) {
    return next(new AppError("please login", 401));
  }

  try {
    const user = await client.user.findFirst({
      where: {
        id: parseInt(userId),
      },
      select: {
        firstName: true,
        lastName: true,
        buisnessName: true,
        email: true,
        phoneNumber: true,
      },
    });
    if (!user) {
      return next(new AppError("user not found", 404));
    } else {
      res.status(200).json({
        user,
      });
    }
  } catch (err) {
    return next(err);
  }
});

app.patch("/me", auth, async (req, res, next) => {
  const userId = req.userId;
  if (!userId) return next(new AppError("please login", 401));
  const profileSchema = z.object({
    firstName: z.string().trim().min(2).max(80),
    lastName: z.string().trim().min(2).max(80),
    buisnessName: z.string().trim().min(2).max(160),
    email: z.string().trim().toLowerCase().email().max(254),
    phoneNumber: z.string().trim().regex(/^[0-9]{10}$/),
  }).strict();
  const parsed = profileSchema.safeParse(req.body);
  if (!parsed.success) return next(new AppError("invalid credentials", 400));
  try {
    const user = await client.user.update({
      where: { id: parseInt(userId) },
      data: parsed.data,
      select: {
        firstName: true,
        lastName: true,
        buisnessName: true,
        email: true,
        phoneNumber: true,
      },
    });
    res.status(200).json({ user, message: "profile updated successfully" });
  } catch (err) {
    return next(err);
  }
});

app.get("/bilty-template", auth, async (req, res, next) => {
  if (!req.userId) return next(new AppError("please login", 401));
  try {
    const account = await client.user.findUnique({
      where: { id: parseInt(req.userId) },
      select: { biltyTemplate: true },
    });
    if (!account) return next(new AppError("user not found", 404));
    res.status(200).json({ template: account.biltyTemplate });
  } catch (err) {
    return next(err);
  }
});

app.put("/bilty-template", auth, async (req, res, next) => {
  if (!req.userId) return next(new AppError("please login", 401));
  const shortText = z.string().max(160);
  const templateSchema = z.object({
    carrierName: shortText.optional(),
    tagline: shortText.optional(),
    address: z.string().max(500).optional(),
    phone: z.string().max(40).optional(),
    email: z.string().max(254).optional(),
    gstin: z.string().max(15).optional(),
    title: shortText.optional(),
    copyLabel: shortText.optional(),
    riskNotice: shortText.optional(),
    terms: z.string().max(3000).optional(),
    accent: z.string().regex(/^#[0-9a-f]{6}$/i).optional(),
    logoDataUrl: z.string().max(1_400_000).regex(/^(?:|data:image\/(?:png|jpeg|webp);base64,[A-Za-z0-9+/]+={0,2})$/).optional(),
    currency: z.string().max(12).optional(),
    paperSize: z.enum(["A4", "Letter", "Legal"]).optional(),
    orientation: z.enum(["portrait", "landscape"]).optional(),
    dateLocale: z.enum(["en-IN", "en-GB", "en-US"]).optional(),
    numberPrefix: z.string().max(24).optional(),
    footerText: z.string().max(1500).optional(),
    labels: z.record(z.string().max(60), z.string().max(100)).optional(),
    visible: z.record(z.string().max(60), z.boolean()).optional(),
  }).strict();
  const parsed = z.object({ template: templateSchema }).strict().safeParse(req.body);
  if (!parsed.success) return next(new AppError("invalid template", 400));
  try {
    const account = await client.user.update({
      where: { id: parseInt(req.userId) },
      data: { biltyTemplate: parsed.data.template as Prisma.InputJsonValue },
      select: { biltyTemplate: true },
    });
    res.status(200).json({ template: account.biltyTemplate, message: "document template saved" });
  } catch (err) {
    return next(err);
  }
});

app.post("/create-bilty", auth, async (req, res, next) => {
  const userId = req.userId;
  if (!userId) {
    return next(new AppError("please login", 401));
  }

  const amount = z.number().finite().nonnegative().max(1_000_000_000);
  const gstin = z.string().trim().toUpperCase().regex(/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/);
  const requiredInfo = z.object({
    consignorName: z.string().trim().min(3).max(160),
    consignorGST: gstin,
    consignorAddress: z.string().trim().max(500).optional(),
    consigneeName: z.string().trim().min(3).max(160),
    consigneeGST: gstin,
    consigneeAddress: z.string().trim().max(500).optional(),
    vehicleNumber: z.string().trim().min(3).max(32),
    driverName: z.string().trim().min(3).max(120),
    driverPhone: z.string().regex(/^[0-9]{10}$/),
    deliveryAt: z.string().trim().max(160).optional(),
    transportNumber: z.string().trim().max(80).optional(),
    fromLocation: z.string().trim().max(160).optional(),
    toLocation: z.string().trim().max(160).optional(),
    chargedWeight: z.number().finite().positive().max(1_000_000_000).optional(),
    actualWeight: z.number().finite().positive().max(1_000_000_000).optional(),
    freightRate: amount.optional(),
    biltyCharge: amount.optional(),
    additionalCharge: amount.optional(),
    paidFreight: amount.optional(),
    declaredValue: amount.optional(),
    gstPaidBy: z.enum(["Consignor", "Consignee"]).optional(),
    remarks: z.string().trim().max(3000).optional(),
    goodsDescription: z.string().trim().min(3).max(2000),
    quantity: z.number().int().positive().max(1_000_000),
    weight: z.number().finite().positive().max(1_000_000_000),
    freight: z.number().finite().positive().max(1_000_000_000),
    status: z.enum(["Created", "Pending", "Delivered"]),
  }).strict();

  const parsedDataWithSuccess = requiredInfo.safeParse(req.body);

  if (!parsedDataWithSuccess.success) {
    return next(new AppError("invalid credentials", 400));
  }
  const data = parsedDataWithSuccess.data;

  const bilty = await client.$transaction(
    async (tx) => {
      const counter = await tx.biltyCounter.upsert({
        where: {
          userId: parseInt(userId),
        },
        update: {
          lastBiltyNumber: {
            increment: 1,
          },
        },
        create: {
          userId: parseInt(userId),
          lastBiltyNumber: 1,
        },
      });

      const newBilty = await tx.bilty.create({
        data: {
          biltyNumber: counter.lastBiltyNumber,
          ...data,
          consignorAddress: data.consignorAddress || null,
          consigneeAddress: data.consigneeAddress || null,
          deliveryAt: data.deliveryAt || null,
          transportNumber: data.transportNumber || null,
          fromLocation: data.fromLocation || null,
          toLocation: data.toLocation || null,
          chargedWeight: data.chargedWeight ?? null,
          actualWeight: data.actualWeight ?? null,
          freightRate: data.freightRate ?? null,
          biltyCharge: data.biltyCharge ?? null,
          additionalCharge: data.additionalCharge ?? null,
          paidFreight: data.paidFreight ?? null,
          declaredValue: data.declaredValue ?? null,
          gstPaidBy: data.gstPaidBy ?? null,
          remarks: data.remarks ?? null,
          userId: parseInt(userId),
        },
      });

      return newBilty;
    },
    {
      maxWait: 10000,
      timeout: 15000,
    },
  );

  if (bilty !== null) {
    res.status(201).json({
      message: "bilty created successfully",
      bilty,
    });
  } else {
    return next(new AppError("internal server error", 500));
  }
});

app.get("/dashboard", auth, async (req, res, next) => {
  const userId = req.userId;

  if (!userId) {
    return next(new AppError("please login", 401));
  }

  try {
    const getBilties = await client.bilty.findMany({
      where: {
        userId: parseInt(userId),
      },
    });
    res.status(200).json({
      getBilties,
    });
  } catch (err) {
    return next(err);
  }
});

app.delete("/bilties/:id", auth, async (req, res, next) => {
  const userId = req.userId;

  if (!userId) {
    return next(new AppError("user not found", 401));
  }

  const biltyId = req.params.id;

  if (!biltyId || Array.isArray(biltyId) || !/^[1-9]\d*$/.test(biltyId) || !Number.isSafeInteger(Number(biltyId))) {
    return next(new AppError("please provide bilty id", 400));
  }

  try {
    await client.bilty.delete({
      where: {
        userId: parseInt(userId),
        id: parseInt(biltyId),
      },
    });
    res.status(200).json({
      message: "bilty deleted successfully",
    });
  } catch (err) {
    return next(err);
    // return next(new AppError("bilty not found", 404));
  }
});

app.patch("/bilties/:id", auth, async (req, res, next) => {
  const userId = req.userId;

  if (!userId) {
    return next(new AppError("please login", 401));
  }

  const updateSchema = z.object({
    consignorName: z.string().trim().min(3).max(160).optional(),
    consignorGST: z.string().trim().toUpperCase().regex(/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/).optional(),
    consignorAddress: z.string().trim().max(500).optional(),
    consigneeName: z.string().trim().min(3).max(160).optional(),
    consigneeGST: z.string().trim().toUpperCase().regex(/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/).optional(),
    consigneeAddress: z.string().trim().max(500).optional(),
    vehicleNumber: z.string().trim().min(3).max(32).optional(),
    driverName: z.string().trim().min(3).max(120).optional(),
    driverPhone: z.string().regex(/^[0-9]{10}$/).optional(),
    deliveryAt: z.string().trim().max(160).optional(),
    transportNumber: z.string().trim().max(80).optional(),
    fromLocation: z.string().trim().max(160).optional(),
    toLocation: z.string().trim().max(160).optional(),
    chargedWeight: z.number().finite().positive().max(1_000_000_000).optional(),
    actualWeight: z.number().finite().positive().max(1_000_000_000).optional(),
    freightRate: z.number().finite().nonnegative().max(1_000_000_000).optional(),
    biltyCharge: z.number().finite().nonnegative().max(1_000_000_000).optional(),
    additionalCharge: z.number().finite().nonnegative().max(1_000_000_000).optional(),
    paidFreight: z.number().finite().nonnegative().max(1_000_000_000).optional(),
    declaredValue: z.number().finite().nonnegative().max(1_000_000_000).optional(),
    gstPaidBy: z.enum(["Consignor", "Consignee"]).optional(),
    remarks: z.string().trim().max(3000).optional(),
    goodsDescription: z.string().trim().min(3).max(2000).optional(),
    quantity: z.number().int().positive().max(1_000_000).optional(),
    weight: z.number().finite().positive().max(1_000_000_000).optional(),
    freight: z.number().finite().positive().max(1_000_000_000).optional(),
    status: z.enum(["Created", "Pending", "Delivered"]).optional(),
  }).strict().refine((data) => Object.keys(data).length > 0, "At least one field is required");

  const result = updateSchema.safeParse(req.body);

  if (!result.success) {
    return next(new AppError("invalid credentials", 400));
  }

  const updateData = Object.fromEntries(
    Object.entries(result.data).filter(([_, value]) => value !== undefined),
  );

  const biltyId = req.params.id;

  if (!biltyId || Array.isArray(biltyId) || !/^[1-9]\d*$/.test(biltyId) || !Number.isSafeInteger(Number(biltyId))) {
    return next(new AppError("please provide bilty id", 400));
  }

  try {
    await client.bilty.update({
      where: {
        userId: parseInt(userId),
        id: parseInt(biltyId),
      },
      data: updateData,
    });
    res.status(200).json({
      message: "bilty uodated",
    });
  } catch (err) {
    return next(err);

    // return next(new AppError("bilty not found", 404));
  }
});

app.get("/bilties", auth, async (req, res, next) => {
  const page = Number(req.query.page ?? 1);
  const limit = Number(req.query.limit ?? 10);
  const sort = req.query.sort ?? "createdAt";
  const order = req.query.order ?? "desc";

  const allowedSortFields = ["createdAt", "freight", "biltyNumber"];

  if (typeof sort !== "string" || !allowedSortFields.includes(String(sort))) {
    return next(new AppError("invalid input", 400));
  }
  if (typeof order !== "string" || !["asc", "desc"].includes(String(order))) {
    return next(new AppError("invalid input", 400));
  }

  const status = req.query.status;
  const search = typeof req.query.search === "string" ? req.query.search.trim() : "";

  if (!Number.isInteger(page) || page < 1 || !Number.isInteger(limit) || limit < 1 || limit > 100) {
    return next(new AppError("invalid input", 400));
  }

  if (status !== undefined && !["Created", "Pending", "Delivered"].includes(String(status))) {
    return next(new AppError("Invalid status", 400));
  }
  // if(search === undefined){
  //     return next(new AppError("please enter things to search", 400));
  // }

  const userId = req.userId;

  if (!userId) {
    return next(new AppError("please login", 401));
  }
  const skip = (page - 1) * limit;

  try {
    const where = {
      userId: parseInt(userId),

      ...(status && {
        status: String(status),
      }),
      ...(search && {
        //... is for optional means if the search is given then ok include it else no worries
        OR: [
          { consignorName: { contains: String(search), mode: "insensitive" as const } },
          { consigneeName: { contains: String(search), mode: "insensitive" as const } },
          { vehicleNumber: { contains: String(search) } },
          { consignorGST: { contains: String(search) } },
          { consigneeGST: { contains: String(search) } },
          { driverName: { contains: String(search) } },
          { driverPhone: { contains: String(search) } },
          { goodsDescription: { contains: String(search), mode: "insensitive" as const } },
        ],
      }),
    };

    const biltyTransacction = await client.$transaction(
      async (tx) => {
        const filteredBilties = await tx.bilty.findMany({
          where,
          skip,
          take: limit,
          orderBy: [{ [sort]: order }, { id: "desc" }],
        });

        const totalBilties = await tx.bilty.count({
          where,
        });

        const totalPages = Math.ceil(totalBilties / limit);
        return {
          filteredBilties,
          totalBilties,
          totalPages,
        };
      },
      {
        maxWait: 10000,
        timeout: 15000,
      },
    );
    res.status(200).json({
      bilties: biltyTransacction.filteredBilties,
      paginationData: {
        page: page,
        limit: limit,
        totalBilties: biltyTransacction.totalBilties,
        totalPages: biltyTransacction.totalPages,
      },
    });
  } catch (err) {
    return next(err);
  }
});

app.use((_req, res) => {
  res.status(404).json({ message: "Not found" });
});

app.use((err: unknown, req: Request, res: Response, _next: NextFunction) => {
  const errorName = err instanceof Error ? err.name : "UnknownError";
  console.error("Request failed", { method: req.method, path: req.path, error: errorName });

  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === "P2025") {
      return res.status(404).json({
        message: "Request Object not Found",
      });
    } else if (err.code === "P2002") {
      return res.status(409).json({
        message: "already exist",
      });
    }
  }
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      message: err.message,
    });
  }

  if (err instanceof SyntaxError && "status" in err && err.status === 400) {
    return res.status(400).json({ message: "Invalid JSON body" });
  }
  if (err instanceof Error && err.message === "Origin is not allowed by CORS") {
    return res.status(403).json({ message: "Origin is not allowed" });
  }

  return res.status(500).json({
    message: "internal server error",
  });
});

export default app;
