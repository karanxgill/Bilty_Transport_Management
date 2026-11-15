import { Button } from "../../../shared/components/ui/Button";
import heroImage from "../../../shared/assets/home/dashboard-preview.png";
import { Cards } from "../../../shared/components/ui/ComparisonCard";
import traditionalBilty from "../../../shared/assets/home/traditional-bilty.png";
import biltyflow from "../../../shared/assets/home/digital-bilty.png";
import { CheckIcon, CrossIcon } from "../../../shared/components/icons/GeneralIcons";
import { FeaturesArray } from "../data/featureItems";
import { FeaturesCard } from "./FeatureCards";

export function HomeSections() {
  const pointers = ["handwritten records", "time-consuming searches", "hard to share updates"];
  return (
    <div className="w-full min-h-screen">
      <div className="flex flex-col gap-6 items-center justify-center">
        <div className="bg-brand-light px-4 py-1 rounded-full mt-15">
          <p className="text-violet-400 text-sm/4 font-[450] tracking-wider">
            THE SMARTER WAY TO MANAGE BILTIES
          </p>
        </div>
        <p className="text-5xl text-text-primary font-semibold">
          Paper bilties are a thing of the past.
        </p>
        <p className="text-text-placeholder tracking-wider text-lg">
          Create, manage, and share digital bilties with ease. Less paperwork, more time for your
          business.
        </p>

        <div className="flex justify-center items-center gap-5">
          <Button varient={"primary"} size={"lg"} text={"Get Started For Free"} />
          <Button varient={"secondary"} size={"lg"} text={"Explore Features"} />
        </div>

        <section className="w-full px-6 mt-10">
          <div className="mx-auto w-full max-w-7xl overflow-hidden rounded-xl">
            <img
              src={heroImage}
              alt="BiltyFlow transport management dashboard"
              className="block w-full h-auto object-contain rounded-xl"
            />
          </div>
        </section>
        <section className="w-full px-6 m-10">
          <div className="flex flex-col gap-2 items-center justify-center">
            <p className="text-3xl text-text-primary font-semibold">
              Everything you need to go paperless
            </p>
            <p className="text-text-placeholder tracking-wider text-lg">
              Simple tools to create and manage your transport documents.
            </p>

            <div className="w-full flex justify-center items-center">
              <div className="flex gap-10 mx-20 mt-8">
                <Cards
                  image={
                    <img
                      className="block w-full h-auto object-contain rounded-xl"
                      src={traditionalBilty}
                      alt="bilty"
                    />
                  }
                  title={"Tradtional Bilty"}
                  description={
                    "The best solution is to give both images a fixed-height container though you're using the same"
                  }
                  pointers={pointers}
                  pointerIcon={<CrossIcon />}
                  comparisonCards={true}
                />
                <Cards
                  image={
                    <img
                      className="block w-full h-auto object-contain rounded-xl"
                      src={biltyflow}
                      alt="bilty"
                    />
                  }
                  title={"With BiltyFlow"}
                  description={
                    "Both images have different aspect ratios, so even though you're using the same"
                  }
                  pointerIcon={<CheckIcon />}
                  pointers={[
                    "Create Digital bilties",
                    "Find Records in seconds",
                    "Share details easily",
                  ]}
                  comparisonCards={true}
                />
              </div>
            </div>
          </div>
        </section>
        <section className="w-full min-h-screen relative overflow-hidden">
          <div className=" absolute right-[5%] top-[10%] w-[700px] h-[500px] rounded-full bg-purple-400/25 blur-3xl pointer-events-none " />

          <div className="absolute right-[25%] bottom-[10%] w-[400px] h-[300px] rounded-full bg-blue-300/20 blur-3xl pointer-events-none" />

          <div className="flex flex-col gap-10">
            {FeaturesArray.map((item) => (
              <FeaturesCard
                key={item.key}
                cardIcon={item.cardIcon}
                title={item.title}
                description={item.description}
                pointers={item.pointers}
                pointerIcon={item.pointerIcon}
                counter={item.counter}
                image={item.image}
                right={item.right}
              />
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
