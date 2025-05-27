// import PageNav from "../components/PageNav";

// export default function Product() {
//   return (
//     <main className="min-h-[calc(100vh-6rem)] p-8 md:p-12 bg-dark-1 flex flex-col">
//       <PageNav />
//       <section className="w-full max-w-[120rem] mx-auto my-16 px-4 grid grid-cols-1 md:grid-cols-2 gap-12 items-center flex-grow">
//         <img
//           src="img-1.jpg"
//           alt="person with dog overlooking mountain with sunset"
//           className="w-full h-auto rounded-lg shadow-lg"
//         />
//         <div>
//           <h2 className="text-4xl md:text-5xl font-bold mb-8 text-brand-2 leading-tight">
//             About WorldWide.
//           </h2>
//           <p className="text-lg md:text-xl mb-8 leading-relaxed">
//             Lorem ipsum dolor sit amet consectetur adipisicing elit. Illo est
//             dicta illum vero culpa cum quaerat architecto sapiente eius non
//             soluta, molestiae nihil laborum, placeat debitis, laboriosam at fuga
//             perspiciatis?
//           </p>
//           <p className="text-lg md:text-xl mb-8 leading-relaxed">
//             Lorem, ipsum dolor sit amet consectetur adipisicing elit. Corporis
//             doloribus libero sunt expedita ratione iusto, magni, id sapiente
//             sequi officiis et.
//           </p>
//         </div>
//       </section>
//     </main>
//   );
// }

import PageNav from "../components/PageNav";

export default function Product() {
  return (
    <main className="min-h-screen bg-cover bg-center bg-no-repeat bg-[url('/bg.jpg')] font-manrope">
      <div className="bg-dark-0/80 min-h-screen flex flex-col">
        <PageNav />

        <section className="flex-1 flex items-center justify-center p-4 md:p-8 lg:p-12">
          <div className="w-full max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            {/* Image Section */}
            <div className="order-2 lg:order-1">
              <div className="relative overflow-hidden rounded-2xl shadow-2xl group">
                <img
                  src="img-1.jpg"
                  alt="Person with dog overlooking mountain with sunset"
                  className="w-full h-64 sm:h-80 md:h-96 lg:h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-dark-0/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </div>
            </div>

            {/* Content Section */}
            <div className="order-1 lg:order-2 space-y-6 lg:space-y-8">
              <div>
                <h2 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold text-light-1 leading-tight mb-4">
                  About{" "}
                  <span className="text-brand-2 drop-shadow-lg">WorldWise</span>
                </h2>
                <div className="w-20 h-1 bg-brand-2 rounded-full"></div>
              </div>

              <div className="space-y-4 lg:space-y-6">
                <p className="text-base sm:text-lg lg:text-xl text-light-2 leading-relaxed">
                  WorldWise is your ultimate travel companion, designed to help
                  you document and share your incredible journeys around the
                  globe. Our interactive world map lets you mark every
                  destination you've visited, creating a visual story of your
                  adventures.
                </p>

                <p className="text-base sm:text-lg lg:text-xl text-light-2 leading-relaxed">
                  Whether you're a seasoned globetrotter or just starting your
                  travel journey, WorldWise makes it easy to keep track of where
                  you've been and inspire where you'll go next.
                </p>
              </div>

              {/* Feature Highlights */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-8">
                <div className="bg-dark-2/50 backdrop-blur-sm p-4 rounded-lg border border-dark-1">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-3 h-3 bg-brand-2 rounded-full"></div>
                    <h3 className="text-light-1 font-semibold">
                      Interactive Maps
                    </h3>
                  </div>
                  <p className="text-sm text-light-0">
                    Mark your visited locations on a beautiful world map
                  </p>
                </div>

                <div className="bg-dark-2/50 backdrop-blur-sm p-4 rounded-lg border border-dark-1">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-3 h-3 bg-brand-1 rounded-full"></div>
                    <h3 className="text-light-1 font-semibold">
                      Travel Stories
                    </h3>
                  </div>
                  <p className="text-sm text-light-0">
                    Add notes and memories to each destination
                  </p>
                </div>

                <div className="bg-dark-2/50 backdrop-blur-sm p-4 rounded-lg border border-dark-1">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-3 h-3 bg-brand-2 rounded-full"></div>
                    <h3 className="text-light-1 font-semibold">
                      Share & Inspire
                    </h3>
                  </div>
                  <p className="text-sm text-light-0">
                    Show friends your travel achievements
                  </p>
                </div>

                <div className="bg-dark-2/50 backdrop-blur-sm p-4 rounded-lg border border-dark-1">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-3 h-3 bg-brand-1 rounded-full"></div>
                    <h3 className="text-light-1 font-semibold">
                      Progress Tracking
                    </h3>
                  </div>
                  <p className="text-sm text-light-0">
                    See how much of the world you've explored
                  </p>
                </div>
              </div>

              {/* Statistics */}
              <div className="grid grid-cols-3 gap-4 pt-6 border-t border-dark-1">
                <div className="text-center">
                  <div className="text-2xl lg:text-3xl font-bold text-brand-2">
                    195
                  </div>
                  <div className="text-xs lg:text-sm text-light-0 uppercase tracking-wide">
                    Countries
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-2xl lg:text-3xl font-bold text-brand-1">
                    10K+
                  </div>
                  <div className="text-xs lg:text-sm text-light-0 uppercase tracking-wide">
                    Cities
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-2xl lg:text-3xl font-bold text-brand-2">
                    50K+
                  </div>
                  <div className="text-xs lg:text-sm text-light-0 uppercase tracking-wide">
                    Travelers
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
