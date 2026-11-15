import type { ReactElement } from "react";

interface CardProps {
  title?: string;
  description?: string;
  pointers?: string[];
  cardIcon?: ReactElement;
  pointerIcon?: ReactElement;
  image?: ReactElement;
  featureCard?: boolean;
  comparisonCards?: boolean;
  counter?: string;
}

export function Cards(props: CardProps) {
  return (
    <div
      className={`${props.comparisonCards ? "border border-violet-300 " : "shadow-lg"} bg-surface opacity-90 rounded-xl gap-4`}
    >
      {props.featureCard ? (
        <div className={`w-auto flex flex-col justify-start p-5`}>
          {props.counter ? (
            <div className="w-fit bg-brand-light text-violet-400 font-semibold rounded-full px-2 py-1 my-2">
              {props.counter}
            </div>
          ) : null}
          {props.cardIcon ? (
            <div className="w-fit bg-brand-light rounded-xl px-3 py-3 mx-5 my-2">
              {props.cardIcon}
            </div>
          ) : null}
          <div className="flex flex-col px-4 py-4">
            {props.title ? (
              <div className="text-3xl font-stretch-semi-expanded text-text-primary font-bold">
                {props.title}
              </div>
            ) : null}
            {props.description ? (
              <div className=" break-words max-w-100 text-lg leading-6 text-text-secondary text-wrap py-2">
                {props.description}
              </div>
            ) : null}
            {props.pointers?.map((item) => (
              <div className="flex items-center gap-2 py-1 mt-2">
                {props.pointerIcon ? (
                  <span className="bg-brand-light rounded-full px-1 py-1">{props.pointerIcon}</span>
                ) : null}
                {item}
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="w-full flex flex-col justify-start">
          {props.image ? (
            <div className="w-full h-95 overflow-hidden p-6 rounded-xl">{props.image} </div>
          ) : null}
          <div className="flex flex-col px-4 py-4">
            {props.title ? (
              <div className="text-3xl  text-text-primary font-bold"> {props.title}</div>
            ) : null}
            {props.description ? (
              <div className=" break-words max-w-100 text-lg leading-6 text-text-secondary text-wrap py-2">
                {props.description}{" "}
              </div>
            ) : null}
            {props.pointers?.map((item) => (
              <div className="flex items-center gap-2 py-1 mt-2">
                {props.pointerIcon ? (
                  <span className="bg-brand-light rounded-full px-1 py-1">{props.pointerIcon}</span>
                ) : null}{" "}
                {item}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
