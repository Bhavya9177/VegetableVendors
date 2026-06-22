import { useState } from 'react'
import { StarIcon } from '@heroicons/react/24/solid'

const SIZES = { sm: 'w-3.5 h-3.5', md: 'w-5 h-5', lg: 'w-6 h-6' }

export default function StarRating({
  rating = 0,
  max = 5,
  size = 'sm',
  interactive = false,
  onChange,
}) {
  const [hovered, setHovered] = useState(null)
  const display = interactive ? (hovered ?? rating ?? 0) : (rating ?? 0)
  const sizeClass = SIZES[size] || SIZES.sm

  return (
    <div className={`flex items-center gap-0.5 ${interactive ? '' : 'pointer-events-none'}`}>
      {Array.from({ length: max }, (_, i) => (
        <StarIcon
          key={i}
          onClick={() => interactive && onChange?.(i + 1)}
          onMouseEnter={() => interactive && setHovered(i + 1)}
          onMouseLeave={() => interactive && setHovered(null)}
          className={`${sizeClass} transition-colors ${interactive ? 'cursor-pointer' : ''} ${
            i < display ? 'text-yellow-400' : 'text-gray-200'
          }`}
        />
      ))}
    </div>
  )
}
