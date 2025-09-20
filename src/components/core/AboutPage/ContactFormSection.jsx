import React from "react";
import ContactUsForm from "../../ContactPage/ContactUsForm";

const ContactFormSection = () => {
  return (
    <div className="mx-auto flex flex-col items-center">
      <h1 className="text-center sm:text-4xl text-2xl font-semibold">Get in Touch</h1>
      <p className="text-center text-richblack-300 mt-3 text-sm sm:text-lg">
        We&apos;d love to here for you, Please fill out this form.
      </p>
      <div className="mt-12 mx-auto flex flex-col items-center">
        <ContactUsForm />
      </div>
    </div>
  );
};

export default ContactFormSection;