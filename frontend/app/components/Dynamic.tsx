'use client';

import Image from "next/image";
import { useState } from "react";

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
                  <h1 className="font-robuck text-6xl md:text-[6vw] text-[#a8a0a1] group-hover:text-[#404040] group-data-[state=open]:text-[#404040]">
                    {data.title}
                  </h1>
                </div>
                <div className="md:col-span-7 lg:col-span-7 flex justify-between items-baseline md:pl-8 pr-4 md:pr-0">
                  <p className="text-[#a8a0a1] group-hover:text-[#404040] group-data-[state=open]:text-[#404040]">
                    {data.description}
                  </p>
                  <div className="hidden md:block text-[#a8a0a1] group-hover:text-[#404040] group-data-[state=open]:text-[#404040]">
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
                        className="object-cover grayscale"
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
