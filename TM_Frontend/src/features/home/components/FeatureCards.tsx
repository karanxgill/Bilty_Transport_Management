import type { ReactElement } from "react";
import { Cards } from "../../../shared/components/ui/ComparisonCard";

interface CardProps {
  title?: string;
  description?: string;
  pointers?: string[];
  cardIcon?: ReactElement;
  pointerIcon?: ReactElement;
  image?: string;
  featureCard?: boolean;
  counter?: string;
  right?: boolean;
}

export function FeaturesCard(props: CardProps) {
  console.log("IMAGE:", props.image);
  return (
    <div className="relative z-10 w-full min-h-[550px]">
      <div
        className={`absolute top-1/2 -translate-y-1/2  z-30 ${props.right ? "left-[5%] w-[48%]" : "right-[5%] w-[35%]"}`}
      >
        <Cards
          cardIcon={props.cardIcon}
          title={props.title}
          description={props.description}
          pointers={props.pointers}
          pointerIcon={props.pointerIcon}
          featureCard={true}
          counter={props.counter}
        />
      </div>

      <div
        className={`absolute top-1/2 -translate-y-1/2 w-[65%] z-40 ${props.right ? "left-[34%]" : "right-[34%]"}`}
      >
        <img src={props.image} alt="BiltyFlow dashboard" className="w-full h-auto object-contain" />
      </div>
    </div>
  );
}
