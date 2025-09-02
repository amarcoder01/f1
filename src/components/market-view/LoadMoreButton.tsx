import React from 'react'
import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface LoadMoreButtonProps {
  onClick: () => void
  loading: boolean
  disabled?: boolean
}

export const LoadMoreButton: React.FC<LoadMoreButtonProps> = ({ 
  onClick, 
  loading, 
  disabled = false 
}) => {
  return (
    <div className="flex justify-center mt-8">
      <Button
        onClick={onClick}
        disabled={loading || disabled}
        variant="outline"
        className="flex items-center px-6 py-3"
      >
        {loading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
            Loading...
          </>
        ) : (
          'Load More Stocks'
        )}
      </Button>
    </div>
  )
}
