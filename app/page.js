// File: app/page.js
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight, Shield } from 'lucide-react';
import Data from '@/utils/Data.json'
export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-100 to-white dark:from-gray-900 dark:to-gray-800">
      <main className="container mx-auto px-4 py-16">
        <h1 className="text-5xl font-bold text-center mb-8">
          Earthquake Impact Estimation
        </h1>
        <p className="text-xl text-center mb-12">
          Assess your building's safety with AI-powered analysis
        </p>
        {/* <p className='leading-loose max-w-md mt-4 md:ml-32 md:mb-6 white:bg-yellow-200'>
          {Data.description}
        </p> */}
        <div className="flex justify-center space-x-4">
          <Link href="/assessment/1">
            <Button size="lg" className="text-lg">
              Start Assessment <ArrowRight className="ml-2" />
            </Button>
          </Link>
          <Link href="/about">
            <Button size="lg" variant="outline" className="text-lg">
              Learn More <Shield className="ml-2" />
            </Button>
          </Link>
        </div>
        <p className='font-extrabold capitalize text-center mt-20'>
          {Data.text}

        </p>
      </main>
    </div>
  );
}