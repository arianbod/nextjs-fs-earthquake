'use client';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Camera, LogOut } from 'lucide-react';
import LandingImg from '@/assets/main.webp';
import Data from '@/utils/action';
import Link from 'next/link';
import Video from '@/components/welcomePage/Video';

export default function Home() {
    return (
        <main className=' min-h-screen'>
            <section className='max-w-6xl mx-auto px-4 sm:px-8 py-12 grid lg:grid-cols-2 gap-8 items-center'>
                {/* Textual Content */}
                <div className='space-y-6'>
                    <h1 className='text-4xl md:text-5xl font-extrabold text-gray-800'>
                        {Data.welcomeTitle}
                    </h1>
                    <p className='text-lg text-gray-600'>{Data.welcomeDescription}</p>
                    <ul className='list-disc list-inside text-gray-700 space-y-2'>
                        {Data.objectives.map((item, index) => (
                            <li key={index} className='ml-4'>
                                {item}
                            </li>
                        ))}
                    </ul>
                    <Button
                        asChild
                        className='mt-6 bg-blue-600 hover:bg-blue-700 transition-colors duration-300'>
                        <Link href='/step-1'>Get Started</Link>
                    </Button>
                </div>

                {/* Visual Content */}
                <div className='flex justify-center'>
                    <Video />
                </div>
            </section>
        </main>
    );
}
