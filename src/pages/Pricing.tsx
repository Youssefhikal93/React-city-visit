// // Uses the same styles as Product
// import PageNav from "../components/PageNav";
// export default function Product() {
//   return (
//     <main className="min-h-[calc(100vh-6rem)] p-8 md:p-12 bg-dark-1 flex flex-col">
//       <PageNav />
//       <section className="w-full max-w-[120rem] mx-auto my-16 px-4 grid grid-cols-1 md:grid-cols-2 gap-12 items-center flex-grow">
//         <div>
//           <h2 className="text-4xl md:text-5xl font-bold mb-8 text-brand-2 leading-tight">
//             Simple pricing.
//             <br />
//             Just $9/month.
//           </h2>
//           <p className="text-lg md:text-xl mb-8 leading-relaxed">
//             Lorem ipsum dolor, sit amet consectetur adipisicing elit. Vitae vel
//             labore mollitia iusto. Recusandae quos provident, laboriosam fugit
//             voluptatem iste.
//           </p>
//         </div>
//         <img
//           src="img-2.jpg"
//           alt="overview of a large city with skyscrapers"
//           className="w-full h-auto rounded-lg shadow-lg"
//         />
//       </section>
//     </main>
//   );
// }
import PageNav from "../components/PageNav";
import { Link } from "react-router-dom";

export default function Pricing() {
  return (
    <main className="min-h-screen bg-cover bg-center bg-no-repeat bg-[url('/bg.jpg')] font-manrope">
      <div className="bg-dark-0/80 min-h-screen flex flex-col">
        <PageNav />

        <section className="flex-1 flex items-center justify-center p-4 md:p-8 lg:p-12">
          <div className="w-full max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            {/* Content Section */}
            <div className="space-y-6 lg:space-y-8">
              <div>
                <h2 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold text-light-1 leading-tight mb-4">
                  Simple pricing.
                  <br />
                  Just{" "}
                  <span className="text-brand-2 drop-shadow-lg">$9/month</span>
                </h2>
                <div className="w-20 h-1 bg-brand-2 rounded-full"></div>
              </div>

              <p className="text-base sm:text-lg lg:text-xl text-light-2 leading-relaxed">
                Get unlimited access to all Worldvisit features for just $9 per
                month. No hidden fees, no complicated tiers - just one simple
                price for everything you need to track your travel adventures.
              </p>

              {/* Pricing Card */}
              <div className="bg-dark-2/90 backdrop-blur-sm rounded-2xl p-6 lg:p-8 border border-dark-1 shadow-2xl">
                <div className="text-center mb-6">
                  <div className="text-4xl lg:text-5xl font-bold text-brand-2 mb-2">
                    $9
                    <span className="text-lg text-light-0 font-normal">
                      /month
                    </span>
                  </div>
                  <p className="text-light-2">
                    Everything you need to explore the world
                  </p>
                </div>

                {/* Features List */}
                <ul className="space-y-3 mb-8">
                  <li className="flex items-center gap-3">
                    <div className="w-5 h-5 bg-brand-2 rounded-full flex items-center justify-center flex-shrink-0">
                      <svg
                        className="w-3 h-3 text-dark-0"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                    <span className="text-light-2">
                      Unlimited country tracking
                    </span>
                  </li>
                  <li className="flex items-center gap-3">
                    <div className="w-5 h-5 bg-brand-2 rounded-full flex items-center justify-center flex-shrink-0">
                      <svg
                        className="w-3 h-3 text-dark-0"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                    <span className="text-light-2">Interactive world map</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <div className="w-5 h-5 bg-brand-2 rounded-full flex items-center justify-center flex-shrink-0">
                      <svg
                        className="w-3 h-3 text-dark-0"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                    <span className="text-light-2">
                      Travel notes & memories
                    </span>
                  </li>
                  <li className="flex items-center gap-3">
                    <div className="w-5 h-5 bg-brand-2 rounded-full flex items-center justify-center flex-shrink-0">
                      <svg
                        className="w-3 h-3 text-dark-0"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                    <span className="text-light-2">Share with friends</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <div className="w-5 h-5 bg-brand-2 rounded-full flex items-center justify-center flex-shrink-0">
                      <svg
                        className="w-3 h-3 text-dark-0"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                    <span className="text-light-2">Priority support</span>
                  </li>
                </ul>

                {/* CTA Button */}
                <Link
                  to="/login"
                  className="block w-full bg-brand-2 hover:bg-brand-1 text-dark-0 text-center px-6 py-4 rounded-lg font-bold text-base lg:text-lg transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
                >
                  Start Your Journey
                </Link>
              </div>

              {/* Additional Info */}
              <div className="text-center space-y-2">
                <p className="text-sm text-light-0">
                  ✓ Cancel anytime • ✓ 30-day money back guarantee
                </p>
                <p className="text-xs text-light-0">
                  No setup fees. No commitment. Start exploring today.
                </p>
              </div>
            </div>

            {/* Image Section */}
            <div className="order-first lg:order-last">
              <div className="relative overflow-hidden rounded-2xl shadow-2xl group">
                <img
                  src="img-2.jpg"
                  alt="Overview of a large city with skyscrapers"
                  className="w-full h-64 sm:h-80 md:h-96 lg:h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-dark-0/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                {/* Floating Price Badge */}
                <div className="absolute top-4 right-4 bg-brand-2/90 backdrop-blur-sm text-dark-0 px-4 py-2 rounded-full font-bold shadow-lg">
                  Only $9/mo
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Bottom Section - Testimonial or Additional Info */}
        <section className="border-t border-dark-1 bg-dark-2/30 backdrop-blur-sm">
          <div className="max-w-4xl mx-auto p-6 md:p-8 text-center">
            <div className="flex items-center justify-center gap-2 mb-4">
              <div className="flex gap-1">
                {[...Array(5)].map((_, i) => (
                  <svg
                    key={i}
                    className="w-5 h-5 text-brand-1"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <span className="text-light-2 font-semibold">4.9/5</span>
            </div>
            <p className="text-light-2 text-sm md:text-base italic">
              "Worldvisit has completely transformed how I document my travels.
              The interactive map is amazing and the price is unbeatable!"
            </p>
            <p className="text-light-0 text-sm mt-2">- Sarah, Digital Nomad</p>
          </div>
        </section>
      </div>
    </main>
  );
}
