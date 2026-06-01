"use client";

import { Spinner } from "flowbite-react";

export function SpinnerLoading() {
   return (
      <div className="flex justify-center items-center h-screen">
         <Spinner aria-label="Default status example" />
      </div>
   );
};

export default Spinner;