export const metadata = {
  title: 'About Us | Saleor Store',
  description: 'Learn more about our company, mission, and values',
}

export default function AboutPage() {
  return (
    <div className="bg-white">
      <div className="max-w-7xl mx-auto py-16 px-4 sm:py-24 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl">
            About Our Store
          </h1>
          <p className="mt-4 text-lg leading-6 text-gray-500">
            Connecting customers with quality products since 2020
          </p>
        </div>

        <div className="mt-20">
          <div className="lg:grid lg:grid-cols-12 lg:gap-8">
            <div className="lg:col-span-5">
              <h2 className="text-2xl font-extrabold text-gray-900 sm:text-3xl">
                Our Story
              </h2>
              <p className="mt-3 text-lg text-gray-500">
                Founded in 2020, our e-commerce platform was born out of a simple idea: to create an online shopping experience that truly puts customers first.
              </p>
              <p className="mt-3 text-lg text-gray-500">
                What started as a small operation has grown into a trusted marketplace offering thousands of products across multiple categories. Our commitment to quality, sustainability, and customer satisfaction remains at the heart of everything we do.
              </p>
            </div>
            <div className="mt-12 lg:mt-0 lg:col-span-7">
              <div className="aspect-w-16 aspect-h-9 rounded-lg overflow-hidden">
                <img
                  src="https://images.unsplash.com/photo-1542744173-8e7e53415bb0?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80"
                  alt="Team collaboration"
                  className="w-full h-full object-center object-cover"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="mt-20">
          <h2 className="text-3xl font-extrabold text-center text-gray-900">
            Our Values
          </h2>
          <div className="mt-12 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            <div className="bg-gray-50 p-6 rounded-lg">
              <div className="w-12 h-12 rounded-md bg-indigo-600 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="mt-4 text-lg font-medium text-gray-900">Customer First</h3>
              <p className="mt-2 text-base text-gray-500">
                We believe in putting our customers' needs at the forefront of every decision we make. From intuitive website design to responsive customer service, we're committed to making your shopping experience exceptional.
              </p>
            </div>

            <div className="bg-gray-50 p-6 rounded-lg">
              <div className="w-12 h-12 rounded-md bg-indigo-600 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="mt-4 text-lg font-medium text-gray-900">Sustainability</h3>
              <p className="mt-2 text-base text-gray-500">
                We're committed to reducing our environmental footprint. From eco-friendly packaging to partnering with sustainable brands, we strive to make choices that are good for both our customers and the planet.
              </p>
            </div>

            <div className="bg-gray-50 p-6 rounded-lg">
              <div className="w-12 h-12 rounded-md bg-indigo-600 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
                </svg>
              </div>
              <h3 className="mt-4 text-lg font-medium text-gray-900">Transparency</h3>
              <p className="mt-2 text-base text-gray-500">
                We believe in honest communication with our customers. From clear pricing to detailed product information, we're dedicated to providing you with all the information you need to make informed purchasing decisions.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-20">
          <h2 className="text-3xl font-extrabold text-center text-gray-900">
            Our Team
          </h2>
          <p className="mt-4 max-w-3xl mx-auto text-center text-xl text-gray-500">
            Our diverse team brings together expertise from retail, technology, and customer service to create an exceptional shopping experience.
          </p>

          <div className="mt-12 grid gap-8 md:grid-cols-3">
            <div className="text-center">
              <div className="aspect-w-3 aspect-h-4 rounded-lg overflow-hidden">
                <img
                  src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?ixlib=rb-1.2.1&auto=format&fit=crop&w=634&q=80"
                  alt="CEO portrait"
                  className="w-full h-full object-center object-cover"
                />
              </div>
              <h3 className="mt-6 text-lg font-medium text-gray-900">Sarah Johnson</h3>
              <p className="text-sm text-indigo-600">CEO & Founder</p>
            </div>

            <div className="text-center">
              <div className="aspect-w-3 aspect-h-4 rounded-lg overflow-hidden">
                <img
                  src="https://images.unsplash.com/photo-1531427186611-ecfd6d936c79?ixlib=rb-1.2.1&auto=format&fit=crop&w=634&q=80"
                  alt="CTO portrait"
                  className="w-full h-full object-center object-cover"
                />
              </div>
              <h3 className="mt-6 text-lg font-medium text-gray-900">David Chen</h3>
              <p className="text-sm text-indigo-600">CTO</p>
            </div>

            <div className="text-center">
              <div className="aspect-w-3 aspect-h-4 rounded-lg overflow-hidden">
                <img
                  src="https://images.unsplash.com/photo-1551836022-d5d88e9218df?ixlib=rb-1.2.1&auto=format&fit=crop&w=634&q=80"
                  alt="Head of Customer Experience portrait"
                  className="w-full h-full object-center object-cover"
                />
              </div>
              <h3 className="mt-6 text-lg font-medium text-gray-900">Michelle Rodriguez</h3>
              <p className="text-sm text-indigo-600">Head of Customer Experience</p>
            </div>
          </div>
        </div>

        <div className="mt-20">
          <div className="bg-indigo-600 rounded-lg shadow-xl overflow-hidden">
            <div className="pt-10 pb-12 px-6 sm:pt-16 sm:px-16 lg:p-20">
              <div className="lg:grid lg:grid-cols-2 lg:gap-8">
                <div>
                  <h3 className="text-3xl font-extrabold text-white">
                    Ready to start shopping?
                  </h3>
                  <p className="mt-4 text-lg text-indigo-100">
                    Browse our collection of quality products and enjoy a seamless shopping experience.
                  </p>
                </div>
                <div className="mt-10 lg:mt-0 lg:flex lg:items-center lg:justify-end">
                  <div className="flex items-center justify-center">
                    <a
                      href="/products"
                      className="bg-white px-5 py-3 border border-transparent text-base font-medium rounded-md text-indigo-600 hover:bg-indigo-50"
                    >
                      Shop Now
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
