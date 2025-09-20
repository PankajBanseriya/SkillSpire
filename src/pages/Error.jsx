import ErrorImg from "../assets/Images/404-error-image.jpg"

const Error = () => {
  return (
    <div className='h-[80vh] flex justify-center items-center text-3xl text-white sm:mt-10'>
      <img src={ErrorImg} className="object-fill w-[90%] sm:w-[70%]"/>
    </div>
  )
}

export default Error
