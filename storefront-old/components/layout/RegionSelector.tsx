import React, { Fragment, useState } from 'react'
import { Listbox, Transition } from '@headlessui/react'
import { CheckIcon, ChevronDownIcon } from '@heroicons/react/20/solid'
import { GlobeEuropeAfricaIcon } from '@heroicons/react/24/outline'

const regions = [
  { id: 'nl', name: 'Netherlands', flag: '🇳🇱' },
  { id: 'be', name: 'Belgium', flag: '🇧🇪' },
  { id: 'de', name: 'Germany', flag: '🇩🇪' },
]

export default function RegionSelector() {
  const [selected, setSelected] = useState(regions[0])

  return (
    <Listbox value={selected} onChange={setSelected}>
      <div className="relative">
        <Listbox.Button className="flex items-center text-gray-700 hover:text-primary-600">
          <GlobeEuropeAfricaIcon className="h-4 w-4 mr-1" />
          <span className="mr-1">{selected.flag}</span> 
          <span>{selected.name}</span>
          <ChevronDownIcon className="h-4 w-4 ml-1" />
        </Listbox.Button>
        <Transition
          as={Fragment}
          leave="transition ease-in duration-100"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <Listbox.Options className="absolute z-10 mt-1 max-h-60 w-40 overflow-auto rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none text-sm">
            {regions.map((region) => (
              <Listbox.Option
                key={region.id}
                className={({ active }) =>
                  `relative cursor-pointer select-none py-2 px-4 ${
                    active ? 'bg-primary-100 text-primary-700' : 'text-gray-900'
                  }`
                }
                value={region}
              >
                {({ selected }) => (
                  <div className="flex items-center">
                    <span className="mr-2">{region.flag}</span>
                    <span className={`block truncate ${selected ? 'font-medium' : 'font-normal'}`}>
                      {region.name}
                    </span>
                    {selected ? (
                      <span className="absolute inset-y-0 right-0 flex items-center pr-3 text-primary-600">
                        <CheckIcon className="h-4 w-4" aria-hidden="true" />
                      </span>
                    ) : null}
                  </div>
                )}
              </Listbox.Option>
            ))}
          </Listbox.Options>
        </Transition>
      </div>
    </Listbox>
  )
} 