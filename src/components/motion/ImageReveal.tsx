'use client'

import { motion, useScroll, useTransform } from 'motion/react'
import Image, { type ImageProps } from 'next/image'
import { useRef } from 'react'

import { cn } from '@/lib/cn'

import { useSafeReducedMotion } from './useSafeReducedMotion'

/**
 * Image that unveils with a clip-path wipe, then drifts with a gentle parallax.
 * The wrapper sets the aspect ratio; the image fills it.
 */
export function ImageReveal({
  className,
  imageClassName,
  from = 'bottom',
  parallax = 0.12,
  delay = 0,
  animateOnMount = false,
  alt,
  ...image
}: Omit<ImageProps, 'fill'> & {
  className?: string
  imageClassName?: string
  from?: 'bottom' | 'top' | 'left' | 'right'
  /** 0 disables parallax. 0.12 = image moves 12% of its height across the scroll. */
  parallax?: number
  delay?: number
  animateOnMount?: boolean
}) {
  const ref = useRef<HTMLDivElement>(null)
  const reduce = useSafeReducedMotion()
  const amount = reduce ? 0 : parallax * 50
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] })
  const y = useTransform(scrollYProgress, [0, 1], [`-${amount}%`, `${amount}%`])

  const hidden = {
    bottom: 'inset(100% 0% 0% 0%)',
    top: 'inset(0% 0% 100% 0%)',
    left: 'inset(0% 100% 0% 0%)',
    right: 'inset(0% 0% 0% 100%)',
  }[from]

  // The in-view trigger lives on the unclipped wrapper: Chrome's IntersectionObserver
  // honours the target's own clip-path, so a fully clipped element would never "enter" view.
  const trigger = animateOnMount
    ? { animate: 'visible' }
    : { whileInView: 'visible', viewport: { once: true, amount: 0.3 } }

  const instant = { duration: 0 }

  return (
    <motion.div ref={ref} className={cn('relative overflow-hidden', className)} initial="hidden" {...trigger}>
      <motion.div
        className="absolute inset-0 overflow-hidden"
        variants={{
          hidden: { clipPath: hidden },
          visible: {
            clipPath: 'inset(0% 0% 0% 0%)',
            transition: reduce ? instant : { duration: 1.4, delay, ease: [0.76, 0, 0.24, 1] },
          },
        }}
      >
        <motion.div
          className="absolute inset-[-8%]"
          style={parallax ? { y } : undefined}
          variants={{
            hidden: { scale: 1.25 },
            visible: {
              scale: 1,
              transition: reduce ? instant : { duration: 1.8, delay, ease: [0.16, 1, 0.3, 1] },
            },
          }}
        >
          <Image {...image} alt={alt} fill className={cn('object-cover', imageClassName)} />
        </motion.div>
      </motion.div>
    </motion.div>
  )
}
