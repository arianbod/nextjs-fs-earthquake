// // components/layout/MainLayout.jsx
// import React from 'react';
// import Navbar from '@/components/navigation/Navbar';
// import Sidebar from '@/components/sidebar/Sidebar';

// const MainLayout = ({ children }) => {
// 	return (
// 		<div className='min-h-screen bg-gradient-to-b from-blue-100 to-white dark:from-gray-900 dark:to-gray-800'>
// 			<div className='grid lg:grid-cols-5'>
// 				{/* Sidebar - hidden on mobile */}
// 				{/* <div className='hidden lg:block lg:col-span-1 fixed h-full w-[20%] bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-r border-gray-200 dark:border-gray-800'>
// 					<Sidebar />
// 				</div> */}

// 				{/* Main Content */}
// 				<div className='lg:col-span-4 lg:ml-[25%] min-h-screen'>
// 					{/* <Navbar /> */}
// 					<main className='container mx-auto px-4 py-8'>{children}</main>
// 				</div>
// 			</div>
// 		</div>
// 	);
// };

// export default MainLayout;

import React from 'react';

const layout = ({ children }) => {
	return <>{children}</>;
};

export default layout;
