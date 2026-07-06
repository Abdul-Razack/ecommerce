import Container from '@/shared/ui/layout/Container';
import Skeleton from '@/shared/ui/Skeleton';

export default function ProductLoading() {
  return (
    <div className="bg-white min-h-screen py-20">
      <Container>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-start">
          {/* Left: Image Skeleton */}
          <Skeleton className="aspect-[4/5] w-full" />

          {/* Right: Details Skeleton */}
          <div className="flex flex-col">
            <Skeleton className="h-3 w-32 mb-4" />
            <Skeleton className="h-10 w-3/4 mb-6" />
            <Skeleton className="h-8 w-24 mb-8" />
            
            <div className="space-y-3 mb-10">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-4/5" />
            </div>
            
            <Skeleton className="h-10 w-32 mb-8" />
            
            <div className="flex flex-col gap-3 mb-10">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
            
            <div className="grid grid-cols-2 gap-y-4 pt-8 border-t border-zinc-100">
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-6 w-32" />
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
}
