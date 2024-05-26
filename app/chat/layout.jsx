import Navbar from '@/components/navbar/Navbar';
import Sidebar from '@/components/sidebar/Sidebar';
import React from 'react';

const layout = ({ children }) => {
	return (
		<main className='grid lg:grid-cols-5'>
			{/* first-col hide on small-screen */}

			<div className='hidden lg:block lg:col-span-1 lg:min-h-screen'>
				<Sidebar />
			</div>
			{/* second-col hide dropdown on big-screen */}
			<div className='lg:col-span-4'>
				<Navbar />
				<div className=' sm:px-8'>{children}</div>
			</div>
		</main>
	);
};

export default layout;
