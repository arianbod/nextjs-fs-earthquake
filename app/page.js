import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Camera, LogOut } from 'lucide-react';
import LandingImg from '@/assets/main.png';
import Data from '@/utils/Data.json'
// import Logo from '@/assets/logo.svg';
import Link from 'next/link';
export default function Home() {
  return (
    <main>
      <header className='max-w-6xl mx-auto px-4 sm:px-8 py-6'>
        {/* <Image
          src={LandingImg}
          alt='Logo'
        /> */}
      </header>
      <section className='max-w-6xl mx-auto px-4 sm:px-8 h-screen -mt-20 grid lg:grid-cols-[1fr,400px] items-center'>
        <div className='sm:text-center'>
          <h1 className='capitalize text-4xl md:text-6xl font-bold sm:text-center'>
            {Data.name}
          </h1>
          <p className='leading-loose max-w-md mt-4 md:ml-32 md:mb-6 white:bg-yellow-200'>
            {Data.description}
          </p>
          <p className='font-extrabold capitalize text-center'>
            {Data.text}
          </p>
          <div className='flex justify-center'>

            <Button
              asChild
              className='mt-4 items-center w-44'>
              <Link href='/welcome'>Next</Link>
            </Button>
          </div>
        </div>
        <Image
          src={LandingImg}
          alt={'landing'}
          className='hidden lg:block rounded-full'
        />
      </section>
    </main>
  );
}
