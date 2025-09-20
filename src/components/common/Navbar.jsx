import { useEffect, useState, useRef } from "react"
import { AiOutlineMenu, AiOutlineShoppingCart } from "react-icons/ai"
import { BsChevronDown } from "react-icons/bs"
import { useSelector } from "react-redux"
import { Link, matchPath, useLocation } from "react-router-dom"

import logo from "../../assets/Logo/Full-Light.png"
import { NavbarLinks } from "../../data/navbar-links"
import { apiConnector } from "../../services/apiconnector"
import { categories } from "../../services/apis"
import { ACCOUNT_TYPE } from "../../utils/constants"
import ProfileDropdown from "../core/Auth/ProfileDropDown"
import { TiShoppingCart } from 'react-icons/ti'
import { GiHamburgerMenu } from 'react-icons/gi'

function Navbar() {
  const { token } = useSelector((state) => state.auth)
  const { user } = useSelector((state) => state.profile)
  const { totalItems } = useSelector((state) => state.cart)
  const location = useLocation()

  const [subLink, setsubLink] = useState([])
  const [loading, setLoading] = useState(false)
  

  const show = useRef();
  const overlay = useRef();

  const shownav = () => {
    show.current.classList.toggle('navshow');
    overlay.current.classList.toggle('hidden');
  }


  useEffect(() => {
    (async () => {
      setLoading(true)
      try {
        const res = await apiConnector("GET", categories.CATEGORIES_API)
        setsubLink(res.data.data)
      } catch (error) {
        console.log("Could not fetch Categories.", error)
      }
      setLoading(false)
    })()
  }, [])

  // console.log("sub links", subLink)

  const matchRoute = (route) => {
    return matchPath({ path: route }, location.pathname)
  }

  return (
    <div
      className={`flex h-14 items-center justify-center border-b-[1px] border-b-richblack-700 ${location.pathname !== "/" ? "bg-richblack-800" : ""
        } transition-all duration-200`}
    >
      <div className="flex w-11/12 max-w-maxContent items-center justify-between">
        {/* Logo */}
        <Link to="/">
          <img src={logo} alt="Logo" width={160} height={32} loading="lazy" />
        </Link>
        {/* Navigation links */}
        <nav className="hidden md:block">
          <ul className="flex gap-x-6 text-richblack-25">
            {NavbarLinks.map((link, index) => (
              <li key={index}>
                {link.title === "Catalog" ? (
                  <>
                    <div
                      className={`group relative flex cursor-pointer items-center gap-1 ${matchRoute("/catalog/:catalogName")
                        ? "text-yellow-25"
                        : "text-richblack-25"
                        }`}
                    >
                      <p>{link.title}</p>
                      <BsChevronDown />
                      <div className="invisible absolute left-[50%] top-[50%] z-[1000] flex w-[200px] translate-x-[-50%] translate-y-[3em] flex-col rounded-lg bg-richblack-5 p-4 text-richblack-900 opacity-0 transition-all duration-150 group-hover:visible group-hover:translate-y-[1.65em] group-hover:opacity-100 lg:w-[300px]">
                        <div className="absolute left-[50%] top-0 -z-10 h-6 w-6 translate-x-[80%] translate-y-[-40%] rotate-45 select-none rounded bg-richblack-5"></div>
                        {loading ? (
                          <p className="text-center">Loading...</p>
                        ) : (subLink && subLink.length) ? (
                          <>
                            {subLink
                              // ?.filter(
                              //   (subLink) => subLink?.courses?.length > 0
                              // )
                              ?.map((subLink, i) => (
                                <Link
                                  to={`/catalog/${subLink.name
                                    .split(" ")
                                    .join("-")
                                    .toLowerCase()}`}
                                  className="rounded-lg bg-transparent py-4 pl-4 hover:bg-richblack-50 capitalize"
                                  key={i}
                                >
                                  <p>{subLink.name}</p>
                                </Link>
                              ))}
                          </>
                        ) : (
                          <p className="text-center">No Courses Found</p>
                        )}
                      </div>
                    </div>
                  </>
                ) : (
                  <Link to={link?.path}>
                    <p
                      className={`${matchRoute(link?.path)
                        ? "text-yellow-25"
                        : "text-richblack-25"
                        }`}
                    >
                      {link.title}
                    </p>
                  </Link>
                )}
              </li>
            ))}
          </ul>
        </nav>
        {/* Login / Signup / Dashboard */}
        <div className="hidden items-center gap-x-4 md:flex">
          {user && user?.accountType !== ACCOUNT_TYPE.INSTRUCTOR && (
            <Link to="/dashboard/cart" className="relative">
              <AiOutlineShoppingCart className="text-2xl text-richblack-100" />
              {totalItems > 0 && (
                <span className="absolute animate-bounce bottom-3 -right-2 grid h-5 w-5 place-items-center overflow-hidden rounded-full bg-richblack-600 text-center text-xs font-bold text-yellow-100">
                  {totalItems}
                </span>
              )}
            </Link>
          )}
          {token === null && (
            <Link to="/login">
              <button className="rounded-[8px] border border-richblack-700 bg-richblack-800 px-[12px] py-[8px] text-richblack-100 cursor-pointer">
                Log in
              </button>
            </Link>
          )}
          {token === null && (
            <Link to="/signup">
              <button className="rounded-[8px] border border-richblack-700 bg-richblack-800 px-[12px] py-[8px] text-richblack-100 cursor-pointer">
                Sign up
              </button>
            </Link>
          )}
          {token !== null && <ProfileDropdown />}
        </div>

        <div className={`flex md:hidden relative gap- flex-row`}>
          <GiHamburgerMenu className={`w-16 h-8 fill-richblack-25 absolute -bottom-4 right-0.5 cursor-pointer`} onClick={shownav} />
          <div ref={overlay} className=' fixed top-0 bottom-0 left-0 right-0 z-30 bg w-[100vw] hidden h-[100vh] overflow-y-hidden bg-[rgba(0,0,0,0.5)] ' onClick={shownav}></div>
          <div ref={show} className='mobNav z-50'>
            <nav className=' items-center flex flex-col absolute w-[200px] -left-[200px] top-5 glass2 py-2' ref={show}>
              {
                token == null && (
                  <Link to='/login'>
                    <button onClick={shownav} className=' mt-4 text-center text-[15px] px-6 py-2 rounded-md font-semibold bg-yellow-50 text-black hover:scale-95 transition-all duration-200'>
                      Login
                    </button>
                  </Link>
                )
              }
              {
                token == null && (
                  <Link to='/signup' className='text-yellow-50'>
                    <button onClick={shownav} className='mt-4 text-center text-[15px] px-5 py-2 rounded-md font-semibold bg-yellow-50 text-black hover:scale-95 transition-all duration-200' >
                      Signup
                    </button>
                  </Link>

                )
              }

              {
                token != null && (
                  <div className='mt-2 flex flex-col items-center' >
                    <p className=' text-richblack-50 text-center mb-2'>Account</p>
                    {/* <Link to='/dashboard' onClick={()=>{dispatch(setProgress(100));shownav()}} className="p-2"> */}
                    <ProfileDropdown />
                    {/* </Link> */}
                  </div>
                )
              }
              <div className=' mt-4 mb-4 bg-richblack-25 w-[200px] h-[2px]'></div>
              <p className=' text-xl text-yellow-50 font-semibold'>Courses</p>
              <div className=' flex flex-col items-center pr-4 mt-1 text-center'>
                {
                  subLink?.length < 0 ? (<div></div>) : (
                    subLink?.map((element, index) => (
                      <Link to={`/catalog/${element.name
                        .split(" ")
                        .join("-")
                        .toLowerCase()}`
                      }
                        key={index} onClick={() => { shownav() }} className="p-2 text-sm">
                        <p className=' text-richblack-5 '>
                          {element?.name}
                        </p>
                      </Link>
                    )))
                }
              </div>
              <div className=' mt-4 mb-4 bg-richblack-25 w-[200px] h-[2px]'></div>
              {user && user?.accountType !== ACCOUNT_TYPE.INSTRUCTOR && (
                <Link to="/dashboard/cart" className="relative">
                  <TiShoppingCart className="text-3xl text-richblack-100 my-1" />
                  {totalItems > 0 && (
                    <span className="absolute bottom-5 animate-bounce -right-2 grid h-5 w-5 place-items-center overflow-hidden rounded-full bg-richblack-600 text-center text-xs font-bold text-yellow-100">
                      {totalItems}
                    </span>
                  )}
                </Link>
              )}
              <Link to='/about-us' onClick={() => { shownav() }} className="p-2">
                <p className=' text-richblack-5 '>
                  About
                </p>
              </Link>
              <Link to='/contact' onClick={() => { shownav() }} className="p-2">
                <p className=' text-richblack-5 '>
                  Contact
                </p>
              </Link>
              
            </nav>
          </div>
        </div>

      </div>
    </div>
  )
}

export default Navbar