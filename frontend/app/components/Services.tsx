'use client';

import Image from "next/image";
import { useState } from "react";

const services = [
  {
    title: "Social-Led Brand Strategy",
    description: "Built on how people actually behave, not how brands wish they did.",
    image: "https://images.unsplash.com/photo-1552664730-d307ca884978?q=80&w=2070&auto=format&fit=crop",
    items: ["Brand Positioning", "Social-First Strategy", "Cultural Insights", "Audience Research", "Strategic Planning", "Messaging Frameworks", "Trend Analysis", "Campaign Development", "Agile Brand Playbooks"]
  },
  {
    title: "Content That Moves Culture",
    description: "For when you want something more than \"thumb-stopping.\"",
    image: "https://images.unsplash.com/photo-1611162617474-5b21e879e113?q=80&w=1974&auto=format&fit=crop",
    items: ["Social Content Production", "Content Strategy", "Platform-Native Content", "Creator-Inspired Storytelling", "Video Content For Social", "Memetic Marketing", "Always-On Content", "Reactive Content Creation", "Motion Graphics For Social"]
  },
  {
    title: "Influencer & Creator Partnerships",
    description: "Real relationships with the people moving culture.",
    image: "https://images.unsplash.com/photo-1517048676732-d65bc937f952?q=80&w=2070&auto=format&fit=crop",
    items: ["Influencer Marketing", "Creator Partnerships", "Talent Sourcing", "Cultural Influencer Strategy", "Creator Campaigns", "Paid Influencer Programs", "Organic Influencer Engagement", "Co-Creation Workflows", "Influencer Reporting"]
  },
  {
    title: "Social Intelligence & Performance Design",
    description: "There's a lot you can learn, when you know how to look.",
    image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=2070&auto=format&fit=crop",
    items: ["Social Analytics", "Social Listening", "Real-Time Dashboards", "Content Performance Tracking", "Platform Insights", "Optimization Strategy", "Data-Driven Content", "Predictive Analytics"]
  },
  {
    title: "Paid Social That Doesn't Feel Paid",
    description: "Making every working dollar work harder.",
    image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=2015&auto=format&fit=crop",
    items: ["Paid Social Media", "Social Media Advertising", "Native Ad Creative", "Media Amplification", "Performance Media Buying", "Social A/B Testing", "Multi-Platform Media Strategy", "Creator Amplification", "Integrated Paid Social"]
  },
  {
    title: "Community Management & Channel Strategy",
    description: "Showing up matters more than showing off.",
    image: "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?q=80&w=2064&auto=format&fit=crop",
    items: ["Community Management", "Brand Voice On Social", "Social Media Engagement", "Channel Strategy", "Platform-Specific Content", "Trend-Driven Planning", "Audience Engagement Strategy", "Organic Social Growth"]
  },
  {
    title: "Experiences People Talk About",
    description: "Built to be seen, shared, and remembered.",
    image: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?q=80&w=2070&auto=format&fit=crop",
    items: ["Experiential Marketing", "Social-First Events", "Branded Activations", "Live Content Capture", "Creator Event Integration", "Earned Media Strategy", "Event Content Production", "IRL Engagement With Social Hooks"]
  }
];

export default function Services() {
  const [showingRows, setShowingRows] = useState<number[]>([]);

  const toggleRow = (index: number) => {
    setShowingRows((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
    );
  };

  const isOpen = (index: number) => showingRows.includes(index);

  return (
    <div id="services-list" className="w-full">
      {services.map((service, index) => (
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
                    {service.title}
                  </h1>
                </div>
                <div className="md:col-span-7 lg:col-span-7 flex justify-between items-baseline md:pl-8 pr-4 md:pr-0">
                  <p className="text-[#a8a0a1] group-hover:text-[#404040] group-data-[state=open]:text-[#404040]">
                    {service.description}
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
                        alt={service.title}
                        src={service.image}
                        fill
                        className="object-cover"
                      />
                    </div>
                  </div>
                  <div className="md:col-span-8 lg:col-span-8 md:pl-8 flex flex-col justify-center">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-x-8 gap-y-6">
                      {service.items.map((item, itemIndex) => (
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
