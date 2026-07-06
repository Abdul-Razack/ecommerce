import Container from '@/shared/ui/layout/Container';
import Skeleton from '@/shared/ui/Skeleton';

export default function StoreLoading() {
  return (
    <div className="bg-white min-h-screen py-24">
      <Container>
        <div className="flex flex-col items-center mb-16">
          <Skeleton className="h-4 w-32 mb-4" />
          <Skeleton className="h-10 w-64" />
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="flex flex-col gap-4">
              <Skeleton className="aspect-[4/5] w-full" />
              <div className="space-y-2">
                <Skeleton className="h-3 w-1/3" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/4" />
              </div>
            </div>
          ))}
        </div>
      </Container>
    </div>
  );
}
