import React from 'react';
// Assuming you have set up an alias "@" to point to the root directory

const Video = () => {
	return (
		<iframe
			// width='560'
			// height='315'
			className='rounded-lg min-w-full h-auto min-h-96'
			src='https://www.youtube.com/embed/JfH8Xdw3k4I?si=z3FUePTlNU-Fzx8S'
			title='YouTube video player'
			frameborder='0'
			allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share'
			allowfullscreen></iframe>
	);
};

export default Video;
