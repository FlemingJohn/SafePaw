
import React from 'react';
import { ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';

interface FeatureSectionProps {
  id: string;
  title: string;
  description: string;
  image: string;
  imageSide: 'left' | 'right';
  accentColor: string;
  buttonText: string;
  price?: string;
}

const FeatureSection: React.FC<FeatureSectionProps> = ({
  id,
  title,
  description,
  image,
  imageSide,
  accentColor,
  buttonText,
  price
}) => {
  const isLeft = imageSide === 'left';

  return (
    <section id={id} className="py-12 sm:py-16 md:py-24 lg:py-32 overflow-hidden">
      <div className={`max-w-7xl mx-auto px-4 sm:px-6 md:px-12 flex flex-col ${isLeft ? 'md:flex-row' : 'md:flex-row-reverse'} items-center justify-between gap-10 sm:gap-12 md:gap-16 lg:gap-24`}>

        {/* Image side */}
        <motion.div
          initial={{ opacity: 0, x: isLeft ? -50 : 50 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="w-full md:w-1/2 relative group"
        >
          <div className="relative aspect-square max-w-sm sm:max-w-md md:max-w-lg lg:max-w-md mx-auto">
            {/* Organic Shape Behind */}
            <motion.div
              animate={{
                rotate: [0, 360],
                scale: [1, 1.1, 1]
              }}
              transition={{ repeat: Infinity, duration: 20, ease: "linear" }}
              className={`absolute top-0 left-0 w-full h-full ${accentColor} opacity-20 organic-shape`}
            />

            <img
              src={image}
              alt={title}
              className="relative z-10 w-full h-full object-cover rounded-[2rem] sm:rounded-[2.5rem] md:rounded-[3rem] shadow-xl group-hover:rotate-2 transition-transform duration-500"
            />
          </div>
        </motion.div>

        {/* Text side */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
          className="w-full md:w-1/2 text-center md:text-left"
        >
          {price && (
            <motion.p
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              className="text-2xl sm:text-3xl font-bold text-[#2D2424] mb-3 sm:mb-4"
            >
              {price}
            </motion.p>
          )}
          <h2 className="text-3xl sm:text-4xl md:text-4xl lg:text-5xl font-bold text-[#2D2424] mb-4 sm:mb-5 md:mb-6 leading-tight">
            {title}
          </h2>
          <p className="text-base sm:text-lg text-[#2D2424]/70 mb-6 sm:mb-7 md:mb-8 leading-relaxed max-w-lg mx-auto md:mx-0">
            {description}
          </p>
          <motion.button
            whileHover={{ x: 5 }}
            className="group inline-flex items-center gap-2 border-2 border-[#8B4513] text-[#8B4513] px-5 sm:px-6 py-2.5 sm:py-3 rounded-full font-bold hover:bg-[#8B4513] hover:text-white transition-all min-h-[44px]"
          >
            {buttonText}
            <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </motion.button>
        </motion.div>
      </div>
    </section>
  );
};

export default FeatureSection;
