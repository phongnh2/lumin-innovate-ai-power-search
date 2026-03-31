import Image from 'next/image';

import signatureIcon from '../public/assets/signature.svg';
import uploadIcon from '../public/assets/upload.svg';
import userIcon from '../public/assets/user.svg';

const items = [
  { text: 'Sign up', alt: 'user', src: userIcon, align: 'items-start' },
  {
    text: 'Upload a PDF',
    alt: 'upload',
    src: uploadIcon,
    align: 'items-center'
  },
  {
    text: 'Start editing',
    alt: 'edit',
    src: signatureIcon,
    align: 'items-end'
  }
];

export function Decor() {
  return (
    <div className='relative pb-8'>
      <div className='absolute border border-dashed border-neutral-100 w-1/2 translate-x-1/2 scale-x-[2] mt-4' />
      <ul className='flex justify-between items-center relative'>
        {items.map(({ text, alt, src, align }) => (
          <li key={text}>
            <div className={`relative z-10 flex flex-col justify-center ${align}`}>
              <div className='flex justify-center items-center w-8 h-8 rounded-full bg-secondary-50'>
                <Image
                  src={src}
                  alt={alt}
                  style={{
                    maxWidth: '100%',
                    height: 'auto'
                  }}
                />
              </div>
              <span className='absolute top-11 font-semibold text-neutral-100 w-max'>{text}</span>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
