'use client';
  
import { Post } from "@/sanity.types";
import { Work } from "@/sanity/lib/types";
import { urlForImage } from "@/sanity/lib/utils";
import { init as initHomeScript } from "@/utils/home";
import Link from "next/link";
import { useEffect } from "react";

export default function Home({
  // settings,
  featuredWork,
  recentPosts,
}: {
  // settings: any;
  featuredWork: Work[];
  recentPosts: Post[];
}) {
  
  useEffect(() => {
    const cleanup = initHomeScript();
    return () => {
      if (cleanup) cleanup();
    };
  }, []);

  return (
    <>
      <div id="intro-overlay" className="fixed inset-0 z-50 bg-[#F9FAF0] flex items-center justify-center transition-opacity duration-1000">
        <video id="intro-video" poster="https://39cf74b4a2d6d5dff0a4-775c46aca7cd1526d10918b0d705fa34.ssl.cf2.rackcdn.com/movement/movement-hero.jpg" className="h-full w-auto max-w-none object-cover" playsInline muted>
          <source src="https://39cf74b4a2d6d5dff0a4-775c46aca7cd1526d10918b0d705fa34.ssl.cf2.rackcdn.com/movement/movement-hero.mp4" type="video/mp4" />
        </video>
      </div>
      <div id="scroll-hint" className="absolute inset-0 pointer-events-none flex flex-col items-center justify-end pb-24 z-20 transition-opacity duration-1000 opacity-0">
        <div className="flex flex-col items-center space-y-2">
          {/* <!-- Enlarged SVG Chevron --> */}
          <svg className="w-12 h-12 text-[#5447f4] animate-scroll-up drop-shadow-md" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 15l7-7 7 7"></path>
          </svg>
          {/* Updated Text: New classes applied */}
          <span className="text-[#5447f4] font-bold text-3xl uppercase text-center leading-[26px]" style={{fontFamily: 'Robuck, sans-serif'}}>SCROLL TO<br/>EXPLORE</span>
        </div>
      </div>
      {/* Updated video-source: Added width:0; height:0; to preventing layout thrashing/flashing */}
      <video id="video-source" loop muted autoPlay playsInline crossOrigin="anonymous" style={{position: 'fixed', top: '-10000px', left: '-10000px', width: 0, height: 0, opacity: 0, pointerEvents: 'none', zIndex: -1}}>
        <source src="https://39cf74b4a2d6d5dff0a4-775c46aca7cd1526d10918b0d705fa34.ssl.cf2.rackcdn.com/movement/movement-social.mp4" type="video/mp4" />
      </video>
      {/* Moved buttons to left-2 bottom-5 for mobile. Reduced padding p-2 */}
      {/* Changed gap-6 to gap-2 md:gap-6 as requested */}
      <div className="absolute left-2 bottom-5 md:left-6 md:top-1/2 md:-translate-y-1/2 md:bottom-auto z-30 flex flex-col gap-6 pointer-events-auto">
        <div id="nav-container" className="hidden md:flex flex-col gap-0.5"></div>
        <div className="flex flex-col gap-2 md:gap-6 -ml-1"> 
          <button id="prev-btn" className="bg-[#e3ff4f] text-black rounded-full p-2 md:bg-transparent md:text-white md:p-0 md:rounded-none md:hover:text-[#e3ff9f] transition-colors duration-200 drop-shadow-lg md:shadow-none" aria-label="Previous">
            <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 15l7-7 7 7"></path>
            </svg>
          </button>
          <button id="next-btn" className="bg-[#e3ff4f] text-black rounded-full p-2 md:bg-transparent md:text-white md:p-0 md:rounded-none md:hover:text-[#e3ff9f] transition-colors duration-200 drop-shadow-lg md:shadow-none" aria-label="Next">
            <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M19 9l-7 7-7-7"></path>
            </svg>
          </button>
        </div>
      </div>
      <div id="overlay-container" className="absolute bottom-0 left-0 w-full z-20 text-center pointer-events-none">
        
        {/* Updated Overlays: px-8 (was px-10) md:px-12 md:mx-12, text-4xl md:text-6xl, mt-[-15px] md:mt-[-20px] */}
        <div id="marker-6" className="absolute bottom-0 pb-4 pt-[50px] md:py-5 left-0 w-full text-center transition-opacity duration-500 opacity-0 overlay-inactive overlay-gradient">
          {featuredWork && featuredWork.map((work: Work, index: number)=>(<div key={index} className={`slide-${index + 1} text-[#5447f4]`} style={index > 0 ? {display: 'none'} : undefined}>
            <img src={work.coverImage ? urlForImage(work.coverImage).url() : ''} style={{display: 'none'}}/>
            <h1 className="text-4xl md:text-6xl px-8 md:px-12 md:mx-12">{work.title}</h1>
            <div className="relative block mt-[-15px] md:mt-[-20px] px-8 md:px-12 md:mx-12">
              <p className="relative px-2 py-1 bg-[#e3ff4f] text-black inline-block font-bold mb-2 no-shadow">{work.subtitle}</p>
            </div>
            <Link href={`/work/${work.slug}`} className="inline-block md:text-2xl px-4 py-2 bg-[#e3ff4f] rounded-full font-bold text-black hover:bg-black hover:text-[#e3ff4f] transition-all">VIEW PROJECT</Link>
          </div>))}
          <Link href="/our-work" className="inline-block md:text-2xl px-4 py-2 my-2 bg-[#fb93f2] rounded-full font-bold text-[#e3ff9f] hover:bg-[#e3ff9f] hover:text-[#fb93f2] transition-all">VIEW ALL WORK</Link>
        </div>
        <div id="marker-7" className="absolute bottom-0 pb-4 pt-[50px] md:py-5 left-0 w-full text-center transition-opacity duration-500 opacity-0 overlay-inactive overlay-gradient">
          <h1 className="text-4xl md:text-5xl lg:text-7xl text-[#5447f4] px-8 md:px-12 md:mx-12">WE DO A LOT OF THINGS, BUT BORING ISN’T ONE OF THEM.</h1>
          <p className="text-xl md:text-2xl italic text-[#5447f4] mt-2 px-8 md:px-12 md:mx-12">(Except for when we list them all out like this. But even we must bow to the gods of SEO.)</p>
          <div className="w-full py-3 my-5 block relative bg-[#e3ff4f] overflow-hidden">
            <div className="ticker-track flex w-max whitespace-nowrap font-bold text-black text-2xl animate-ticker ticker-paused">
              <div className="flex">
                <p className="px-6 no-shadow">Social-Led Brand Strategy</p>
                <p className="px-6 no-shadow">•</p>
                <p className="px-6 no-shadow">Content That Moves Culture</p>
                <p className="px-6 no-shadow">•</p>
                <p className="px-6 no-shadow">Influencer & Creator Partnerships</p>
                <p className="px-6 no-shadow">•</p>
                <p className="px-6 no-shadow">Social Intelligence & Performance Design</p>
                <p className="px-6 no-shadow">•</p>
                <p className="px-6 no-shadow">Paid Social That Doesn’t Feel Paid</p>
                <p className="px-6 no-shadow">•</p>
                <p className="px-6 no-shadow">Community Management & Channel Strategy</p>
                <p className="px-6 no-shadow">•</p>
                <p className="px-6 no-shadow">Experiences People Talk About</p>
                <p className="px-6 no-shadow">•</p>
              </div>
              <div className="flex">
                <p className="px-6 no-shadow">Social-Led Brand Strategy</p>
                <p className="px-6 no-shadow">•</p>
                <p className="px-6 no-shadow">Content That Moves Culture</p>
                <p className="px-6 no-shadow">•</p>
                <p className="px-6 no-shadow">Influencer & Creator Partnerships</p>
                <p className="px-6 no-shadow">•</p>
                <p className="px-6 no-shadow">Social Intelligence & Performance Design</p>
                <p className="px-6 no-shadow">•</p>
                <p className="px-6 no-shadow">Paid Social That Doesn’t Feel Paid</p>
                <p className="px-6 no-shadow">•</p>
                <p className="px-6 no-shadow">Community Management & Channel Strategy</p>
                <p className="px-6 no-shadow">•</p>
                <p className="px-6 no-shadow">Experiences People Talk About</p>
                <p className="px-6 no-shadow">•</p>
              </div>
            </div>
          </div>
          <Link href="/services" className="inline-block md:text-2xl my-5 px-4 py-2 bg-[#e3ff4f] rounded-full font-bold text-black hover:bg-black hover:text-[#e3ff4f] transition-all">ALL OUR SERVICES</Link>
        </div>
        <div id="marker-8" className="absolute bottom-0 pb-4 pt-[50px] md:py-5 left-0 w-full text-center transition-opacity duration-500 opacity-0 overlay-inactive overlay-gradient">
          {recentPosts.map((post: Post, index: number) => (
            <div key={post._id} className={`slide-${index + 1} text-[#5447f4]`}>
              <img src={post?.coverImage ? urlForImage(post?.coverImage).url() : ''} style={{display: 'none'}}/>
              <h1 className="text-4xl md:text-6xl px-8 md:px-12 md:mx-12">{post.title}</h1>
              <div className="relative block mt-[-15px] md:mt-[-20px] px-8 md:px-12 md:mx-12">
                <p className="relative px-2 py-1 bg-[#e3ff4f] text-black inline-block font-bold mb-2 no-shadow">1/3/26</p>
              </div>
            <Link href={`/posts/${post.slug}`} className="inline-block md:text-2xl px-4 py-2 bg-[#e3ff4f] rounded-full font-bold text-black hover:bg-black hover:text-[#e3ff4f] transition-all">VIEW POST</Link>
          </div>))}
          <Link href="/feed" className="inline-block md:text-2xl px-4 py-2 my-2 bg-[#fb93f2] rounded-full font-bold text-[#e3ff9f] hover:bg-[#e3ff9f] hover:text-[#fb93f2] transition-all">VIEW ALL POSTS</Link>
        </div>
        <div id="marker-9" className="absolute bottom-0 pb-4 pt-[50px] md:py-5 left-0 w-full text-center transition-opacity duration-500 opacity-0 overlay-inactive overlay-gradient">
          <p className="text-xl md:text-2xl italic text-[#5447f4] px-8 md:px-12 md:mx-12">It’s a Movement</p>
          <h1 className="text-4xl md:text-5xl lg:text-7xl text-[#5447f4] px-8 md:px-12 md:mx-12">DIVERSITY, EQUITY & INCLUSION</h1>
          <p className="text-lg md:text-2xl text-[#5447f4] mt-2 px-8 md:px-12 md:mx-12">An echo chamber is a bad place to be, so we actively create a culture that welcomes and supports diverse perspectives, experiences, and backgrounds.</p>
          <Link href="/people-culture" className="inline-block md:text-2xl my-5 px-4 py-2 bg-[#e3ff4f] rounded-full font-bold text-black hover:bg-black hover:text-[#e3ff4f] transition-all">OUR CULTURE</Link>
        </div>
        <div id="marker-10" className="absolute bottom-0 pb-4 pt-[50px] md:py-5 left-0 w-full text-center transition-opacity duration-500 opacity-0 overlay-inactive overlay-gradient">
          <h1 className="text-4xl md:text-5xl lg:text-7xl text-[#5447f4] px-8 md:px-12 md:mx-12">LET'S WORK TOGETHER!</h1>
          <p className="text-xl md:text-2xl italic text-[#5447f4] px-8 md:px-12 md:mx-12">(In one way or another)</p>
          <p className="text-lg md:text-2xl text-[#5447f4] mt-2 px-8 md:px-12 md:mx-12">Got a project to discuss? Interested in joining forces? Find your way below.</p>
          <Link href="/contact" className="inline-block md:text-2xl my-5 mx-1 px-4 py-2 bg-[#e3ff4f] rounded-full font-bold text-black hover:bg-black hover:text-[#e3ff4f] transition-all">CONTACT</Link>
          <Link href="/careers" className="inline-block md:text-2xl my-5 mx-1 px-4 py-2 bg-[#e3ff4f] rounded-full font-bold text-black hover:bg-black hover:text-[#e3ff4f] transition-all">CAREERS</Link>
        </div>
      </div>
      <div id="canvas-container" className="absolute inset-0 z-0"></div>
      <style>{`
        #canvas-container > canvas {
          max-width: 100vw;
          max-height: 100vh;
        }
      `}</style>
    </>
  );
}