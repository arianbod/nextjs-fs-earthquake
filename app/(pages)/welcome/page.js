import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Camera, LogOut } from 'lucide-react';
import LandingImg from '@/assets/main.webp';
import Data from '@/utils/Data.json'
// import Logo from '@/assets/logo.svg';
import Link from 'next/link';
import Video from '@/components/welcomePage/Video';
export default function Home() {
    return (
        <main>
            {/* <header className='max-w-6xl mx-auto px-4 sm:px-8 py-6'>
            </header> */}
            <section className='max-w-6xl mx-auto px-4 sm:px-8 h-screen -mt-20 grid lg:grid-cols-[1fr,400px] items-center'>
                <div>
                    <h1 className='capitalize text-4xl md:text-5xl font-bold'>
                        {Data.welcomeTitle}
                    </h1>

                    <ul className='md:pl-12 leading-loose max-w-md mt-4 list-disc'>

                        {Data.objectives.map((item) => {
                            return <li key={item}>
                                {item}
                            </li>
                        })}
                    </ul>

                    <Button
                        asChild
                        className='mt-4'>
                        <Link href='/1'>Get Started</Link>
                    </Button>
                </div>


                <Video />
            </section>


        </main>
    );
}
