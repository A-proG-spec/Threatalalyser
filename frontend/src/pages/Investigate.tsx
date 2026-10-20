import { useNavigate } from 'react-router-dom';
import { PageWrapper } from '../components/layout/PageWrapper';
import { SearchBar } from '../components/investigation/SearchBar';
import { useInvestigate } from '../api/investigation';

export function Investigate() {
  const navigate = useNavigate();
  const { mutate: runInvestigation, isPending, error } = useInvestigate();

  const handleSearch = (indicator: string) => {
    // Trigger the API call
    runInvestigation(indicator, {
      onSuccess: (data) => {
        // When successful, redirect to the Report page using the new investigation ID
        navigate(`/report/${data.investigation.id}`);
      },
    });
  };

  return (
    <PageWrapper>
      <div className="flex flex-col items-center justify-center mt-12 md:mt-24 text-center">
        
        {/* Top Label */}
        <span className="text-xs font-bold tracking-[0.2em] text-gray-500 uppercase mb-6 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
          Threat Intelligence Engine
        </span>

        {/* Giant Hero Text */}
        <h1 className="text-5xl md:text-7xl font-semibold tracking-tight text-white mb-6 leading-tight">
          Investigate.<br />
          Right now.
        </h1>

        {/* Subtitle */}
        <p className="max-w-2xl text-lg text-gray-400 mb-12 leading-relaxed">
          Enter a URL, domain, or IP address to gather intelligence from multiple security sources and generate a consolidated threat report.
        </p>

        {/* The Search Bar Component */}
        <SearchBar onSearch={handleSearch} isLoading={isPending} />

        {/* Error Message (if the backend fails completely) */}
        {error && (
          <div className="mt-8 text-red-400 bg-red-400/10 px-6 py-3 rounded-lg text-sm">
            {(error as any).response?.data?.error?.message || 'An error occurred during the investigation.'}
          </div>
        )}

        {/* Loading Text (appears under the search bar while waiting) */}
        {isPending && (
          <p className="mt-8 text-gray-500 animate-pulse text-sm">
            Querying VirusTotal, URLhaus, and AbuseIPDB...
          </p>
        )}

      </div>
    </PageWrapper>
  );
}