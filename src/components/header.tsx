"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import logo from "../assets/logo-trang.png";
import { Home, MapPin, BedDouble, Bath, Heart, UserRound, Menu } from "lucide-react";

export default function Header() {

  return (
    <header className="text-white shadow-md bg-cover bg-center bg-gradient-to-r from-[#006633] to-[#4CAF50]">
      {/* Top bar */}
      <div className="max-w-screen-xl mx-auto px-4 py-2 flex items-center justify-between">
        <Link href="/" className="inline-flex items-center">
          <Image src={logo} alt="Logo" width={80} height={40} priority />
        </Link>

        <div className="flex items-center justify-between gap-10 text-lg font-semibold bg-white text-green-800 py-2 px-5 rounded-full shadow">
          <Link
            href="/"
            className="hover:text-white hover:bg-gradient-to-r hover:from-[#006633] hover:to-[#4CAF50] px-4 py-1 rounded-full transition duration-300 cursor-pointer"
          >
            TÌM PHÒNG
          </Link>
          <Link
            href="/"
            className="hover:text-white hover:bg-gradient-to-r hover:from-[#006633] hover:to-[#4CAF50] px-4 py-1 rounded-full transition duration-300 cursor-pointer"
          >
            TÌM VIỆC
          </Link>
          <Link
            href="/"
            className="hover:text-white hover:bg-gradient-to-r hover:from-[#006633] hover:to-[#4CAF50] px-4 py-1 rounded-full transition duration-300 cursor-pointer"
          >
            TÌM XE
          </Link>
          <Link
            href="/"
            className="hover:text-white hover:bg-gradient-to-r hover:from-[#006633] hover:to-[#4CAF50] px-4 py-1 rounded-full transition duration-300 cursor-pointer"
          >
            TÌM THỢ
          </Link>
        </div>

        <div className="flex items-center justify-between gap-4 text-lg font-semibold">
          <div className="border p-1 rounded-full bg-gradient-to-r from-[#006633] to-[#4CAF50] 
                          hover:scale-110 hover:shadow-lg transition duration-300 cursor-pointer">
            <Heart className="text-white" />
          </div>
          <div className="border p-1 rounded-full bg-gradient-to-r from-[#006633] to-[#4CAF50] 
                          hover:scale-110 hover:shadow-lg transition duration-300 cursor-pointer">
            <UserRound className="text-white" />
          </div>
          <div className="border p-1 rounded-full bg-gradient-to-r from-[#006633] to-[#4CAF50] 
                          hover:scale-110 hover:shadow-lg transition duration-300 cursor-pointer">
            <Menu className="text-white" />
          </div>
        </div>

      </div>
    </header>
  );
}
