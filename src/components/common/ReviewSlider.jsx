import { useEffect, useState } from "react"
import { Rating } from '@smastrom/react-rating'
import '@smastrom/react-rating/style.css'
import { Swiper, SwiperSlide } from "swiper/react"

// Import Swiper styles
import "swiper/css"
import "swiper/css/free-mode"
import "swiper/css/pagination"
import "../../App.css"
// Import required modules
import { Autoplay, FreeMode, Pagination } from "swiper/modules"

// Get apiFunction and the endpoint
import { apiConnector } from "../../services/apiconnector"
import { ratingsEndpoints } from "../../services/apis"


function ReviewSlider() {
  const [reviews, setReviews] = useState([])
  const truncateWords = 15

  useEffect(() => {
    (async () => {
      const { data } = await apiConnector(
        "GET",
        ratingsEndpoints.REVIEWS_DETAILS_API
      )
      if (data?.success) {
        setReviews(data?.data)
      }
      // console.log("Data", data.data)
    })();
  }, [])

  // console.log(reviews)

  return (
    <div className="text-white">
      <div className="my-[50px] h-[184px] max-w-maxContentTab lg:max-w-maxContent">
        <Swiper
          spaceBetween={25}
          loop={reviews.length > 4}
          freeMode={true}
          autoplay={{
            delay: 2500,
            disableOnInteraction: false,
          }}
          breakpoints={{
            640: {
              slidesPerView: 1, 
            },
            768: {
              slidesPerView: 2,
            },
            1024: {
              slidesPerView: 3,
            },
            1280: {
              slidesPerView: 4,
            },
          }}
          autoHeight={true}
          modules={[FreeMode, Pagination, Autoplay]}
          className="w-full mySwiper"
        >
          {reviews.map((review, i) => {
            return (
              <SwiperSlide key={i}>
                <div className="flex flex-col gap-3 bg-richblack-800 p-3 text-[14px] text-richblack-25">
                  <div className="flex items-center gap-4">
                    <img
                      src={
                        review?.user?.image
                          ? review?.user?.image
                          : `https://api.dicebear.com/5.x/initials/svg?seed=${review?.user?.firstName} ${review?.user?.lastName}`
                      }
                      alt="Profile Image"
                      className="h-9 w-9 rounded-full object-cover"
                    />
                    <div className="flex flex-col">
                      <h2 className="font-semibold text-richblack-5">{`${review?.user?.firstName} ${review?.user?.lastName}`}</h2>
                      <h3 className="text-[12px] font-medium text-richblack-500">
                        {review?.course?.courseName}
                      </h3>
                    </div>
                  </div>
                  <p className="font-medium text-richblack-25">
                    {review?.review.split(" ").length > truncateWords
                      ? `${review?.review
                        .split(" ")
                        .slice(0, truncateWords)
                        .join(" ")} ...`
                      : `${review?.review}`}
                  </p>
                  <div className="flex gap-2 items-end">
                    <h3 className="font-semibold text-yellow-100 text-[15px]">
                      {review.rating.toFixed(1)}
                    </h3>
                    <Rating
                      count={5}
                      value={review.rating}
                      style={{ maxWidth: 130 }}
                      readOnly={true}
                    />
                  </div>
                </div>
              </SwiperSlide>
            )
          })}

        </Swiper>
      </div>
    </div>
  )
}

export default ReviewSlider