'use client';

import Image from "next/image";
import { useState } from "react";

type ERGItem = {
  title: string;
  image: string;
  description: string;
  bulletPoints?: string[];
};

type TeamMember = {
  _id: string;
  name: string;
  jobTitle: string;
  portraitUrl?: string;
};

type PeopleCultureData = {
  ergs: ERGItem[];
  benefits: string[];
  leadership: TeamMember[];
};

export function PeopleCulture({jsonData}: {jsonData: PeopleCultureData}) {
  const [openRow, setOpenRow] = useState<number | null>(null);

  const toggleRow = (index: number) => {
    setOpenRow((prev) => (prev === index ? null : index));
  };

  const isOpen = (index: number) => openRow === index;

  const { ergs = [], benefits = [], leadership = [] } = jsonData || {};

  return (
    <>
      <p className="text-xl text-[#5447f4] max-w-[800px] mx-auto mb-12 text-center px-4">
				An echo chamber is a bad place to be, so we actively create a culture that welcomes and supports diverse perspectives, experiences, and backgrounds. Interested to learn more? Check out our Employee Resource Groups.
			</p>
      {/* ERG List Container */}
      <div className="w-full">
        {ergs.map((erg, index) => (
          <div
            key={index}
            className="service-row group border-t-2 border-[#fb93f2] w-full overflow-hidden bg-transparent hover:bg-[#f9dff8] data-[state=open]:bg-[#f9dff8] data-[state=open]:border-transparent"
            data-state={isOpen(index) ? "open" : "closed"}
          >
            <div className="pl-6 md:pl-12 max-w-[1400px] mx-auto px-6">
              <button
                onClick={() => toggleRow(index)}
                className="w-full text-left focus:outline-none py-8 md:py-12 relative z-10 block"
              >
                <div className="grid grid-cols-2 md:grid-cols-12 gap-6 items-baseline">
                  <div className="md:col-span-10 lg:col-span-11">
                    <h1 className="font-robuck text-5xl md:text-[4vw] text-[#fb93f2] group-hover:text-[#5447f4] group-data-[state=open]:text-[#5447f4]">
                      {erg.title}
                    </h1>
                  </div>
                  <div className="md:col-span-2 lg:col-span-1 flex justify-end items-baseline md:pl-8 pr-4 md:pr-0">
                    {/* Icons */}
                    <div className="text-[#fb93f2] group-hover:text-[#5447f4] group-data-[state=open]:text-[#5447f4]">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        fill="currentColor"
                        className={`bi bi-arrow-right w-8 h-8 ${isOpen(index) ? 'hidden' : 'block'}`}
                        viewBox="0 0 16 16"
                      >
                        <path fillRule="evenodd" d="M1 8a.5.5 0 0 1 .5-.5h11.793l-3.147-3.146a.5.5 0 0 1 .708-.708l4 4a.5.5 0 0 1 0 .708l-4 4a.5.5 0 0 1-.708-.708L13.293 8.5H1.5A.5.5 0 0 1 1 8"/>
                      </svg>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        fill="currentColor"
                        className={`bi bi-arrow-down w-8 h-8 ${isOpen(index) ? 'block' : 'hidden'}`}
                        viewBox="0 0 16 16"
                      >
                        <path fillRule="evenodd" d="M8 1a.5.5 0 0 1 .5.5v11.793l3.146-3.147a.5.5 0 0 1 .708.708l-4 4a.5.5 0 0 1-.708 0l-4-4a.5.5 0 0 1 .708-.708L7.5 13.293V1.5A.5.5 0 0 1 8 1"/>
                      </svg>
                    </div>
                  </div>
                </div>
              </button>
              {isOpen(index) && (
                <div className="pb-16">
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-12 px-4 md:px-0">
                    <div className="md:col-span-4 lg:col-span-4 flex justify-center md:justify-start items-start">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={erg.image}
                        alt={erg.title}
                        className="w-full max-w-[200px] h-auto object-contain"
                      />
                    </div>
                    <div className="md:col-span-8 lg:col-span-8 md:pl-8 flex flex-col justify-center">
                      <div className="text-[#5447f4] max-w-3xl">
                        <p className={erg.bulletPoints ? "mb-4" : ""}>{erg.description}</p>
                        {erg.bulletPoints && (
                          <ul className="list-disc pl-5 space-y-2">
                            {erg.bulletPoints.map((point, pointIndex) => (
                              <li key={pointIndex}>{point}</li>
                            ))}
                          </ul>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}

        {/* Footer Stroke */}
        <div id="footer-stroke" className="w-full border-t-2 border-[#fb93f2]"></div>
      </div>

      {/* Leadership Section */}
      <div className="max-w-[1400px] mx-auto px-6 md:px-12 mt-24">
        <h1 className="font-robuck text-6xl text-[#5447f4] mb-12 text-center">LEADERSHIP</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-y-12 gap-x-4 md:gap-x-8 mb-24">
          {leadership.map((person: TeamMember) => (
            <div key={person._id} className="flex flex-col items-center text-center min-w-0">
              <div className="w-32 h-32 md:w-40 md:h-40 rounded-full overflow-hidden mb-4 bg-gray-200">
                {person.portraitUrl && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={person.portraitUrl}
                    alt={person.name}
                    className="w-full h-full object-cover"
                  />
                )}
              </div>
              <h3 className="text-4xl text-mvmnt-blue font-bold mb-1">{person.name}</h3>
              <p className="semibold text-xl text-mvmnt-blue font-replay-italic">{person.jobTitle}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Benefits Section */}
      <div className="pl-6 md:pl-12 max-w-[1400px] mx-auto px-6 mt-24 mb-24">
        <h1 className="font-robuck text-6xl text-[#5447f4] mb-4 text-center">OUR BENEFITS</h1>
        <h3 className="text-mvmnt-blue text-3xl semibold font-replay-italic text-center mb-12">Not too shabby, huh?</h3>

        <div className="mx-auto">
          <ul className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-x-8 gap-y-4 list-disc pl-5 marker:text-[#5447f4]">
            {benefits.map((benefit: string, index: number) => (
              <li key={index} className="text-mvmnt-blue text-xl">{benefit}</li>
            ))}
          </ul>
        </div>
      </div>
    </>
  );
}

export function Services({jsonData}: {jsonData: Array<{
  title: string;
  description: string;
  image: string;
  items: Array<string>;
}>}) {
  const [showingRows, setShowingRows] = useState<number[]>([]);

  const toggleRow = (index: number) => {
    setShowingRows((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
    );
  };

  const isOpen = (index: number) => showingRows.includes(index);

  return (
    <div id="services-list" className="w-full">
      {jsonData.map((data, index) => (
        <div
          key={index}
          className="service-row group border-t-2 border-[#a8a0a1] w-full overflow-hidden bg-transparent hover:bg-[#e3ff4f] data-[state=open]:bg-[#e3ff4f] data-[state=open]:border-transparent"
          data-state={isOpen(index) ? "open" : "closed"}
        >
          <div className="pl-6 md:pl-12 max-w-[1400px] mx-auto px-6">
            <button
              onClick={() => toggleRow(index)}
              className="w-full text-left focus:outline-none py-8 md:py-12 relative z-10 block"
            >
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-baseline">
                <div className="md:col-span-5 lg:col-span-5">
                  <h1 className="font-robuck text-5xl md:text-[4vw] text-[#a8a0a1] group-hover:text-[#404040] group-data-[state=open]:text-[#404040]">
                    {data.title}
                  </h1>
                </div>
                <div className="md:col-span-7 lg:col-span-7 flex justify-between items-center gap-6 md:pl-8 pr-4 md:pr-0">
                  <p className="text-[#a8a0a1] group-hover:text-[#404040] group-data-[state=open]:text-[#404040]">
                    {data.description}
                  </p>
                  <div className="text-[#a8a0a1] group-hover:text-[#404040] group-data-[state=open]:text-[#404040]">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      fill="currentColor"
                      className={`bi bi-arrow-right w-8 h-8 ${isOpen(index) ? 'hidden' : 'block'}`}
                      viewBox="0 0 16 16"
                    >
                      <path fillRule="evenodd" d="M1 8a.5.5 0 0 1 .5-.5h11.793l-3.147-3.146a.5.5 0 0 1 .708-.708l4 4a.5.5 0 0 1 0 .708l-4 4a.5.5 0 0 1-.708-.708L13.293 8.5H1.5A.5.5 0 0 1 1 8"/>
                    </svg>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      fill="currentColor"
                      className={`bi bi-arrow-down w-8 h-8 ${isOpen(index) ? 'block' : 'hidden'}`}
                      viewBox="0 0 16 16"
                    >
                      <path fillRule="evenodd" d="M8 1a.5.5 0 0 1 .5.5v11.793l3.146-3.147a.5.5 0 0 1 .708.708l-4 4a.5.5 0 0 1-.708 0l-4-4a.5.5 0 0 1 .708-.708L7.5 13.293V1.5A.5.5 0 0 1 8 1"/>
                    </svg>
                  </div>
                </div>
              </div>
            </button>
            {isOpen(index) && (
              <div className="pb-16">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-12 px-4 md:px-0">
                  <div className="md:col-span-4 lg:col-span-4">
                    <div className="relative aspect-[4/5] w-full overflow-hidden bg-black/5 rounded-lg">
                      <Image
                        alt={data.title}
                        src={data.image}
                        fill
                        className="object-cover"
                      />
                    </div>
                  </div>
                  <div className="md:col-span-8 lg:col-span-8 md:pl-8 flex flex-col justify-center">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-x-8 gap-y-6">
                        {data.items.map((item: string, itemIndex: number) => (
                        <p key={itemIndex} className="text-[#404040]">{item}</p>
                        ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      ))}

      {/* Footer Stroke */}
      <div id="footer-stroke" className="w-full border-t-2 border-[#a8a0a1]"></div>
    </div>
  );
}
