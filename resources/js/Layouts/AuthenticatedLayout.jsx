                                <NavLink
                                    href={route('location-map')}
                                    active={route().current('location-map')}
                                    className={`inline-flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-all duration-300 group ${
                                        route().current('location-map')
                                            ? 'bg-[#2a4075] text-white shadow-lg shadow-[#2a4075]/30 font-semibold'
                                            : 'text-white hover:bg-gray-800'
                                    }`}
                                >
                                    <svg className={`w-5 h-5 mr-2 transition-transform duration-300 ${route().current('location-map') ? '' : 'group-hover:scale-110'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                    </svg>
                                    Схема заезда
                                </NavLink>

                                {/* Админ-панель */}
                                <NavLink
                                    href={route('admin.dashboard')}
                                    active={route().current('admin.dashboard')}
                                    className={`inline-flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-all duration-300 group ${
                                        route().current('admin.dashboard')
                                            ? 'bg-[#2a4075] text-white shadow-lg shadow-[#2a4075]/30 font-semibold'
                                            : 'text-white hover:bg-gray-800'
                                    }`}
                                >
                                    <svg className={`w-5 h-5 mr-2 transition-transform duration-300 ${route().current('admin.dashboard') ? '' : 'group-hover:scale-110'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                    </svg>
                                    Админ-панель
                                </NavLink> 