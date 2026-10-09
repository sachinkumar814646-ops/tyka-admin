// Avatar.js
import React from "react";

const Avatar = ({ src, alt, className }) => {
  return (
    <img
      src={src}
      alt={alt}
      className={`rounded-full w-16 h-16 object-cover border-2 border-white shadow ${className}`}
    />
  );
};

export default Avatar;
