import React, { useState, useEffect } from 'react';
import { APIProvider, Map, AdvancedMarker, Pin, InfoWindow } from '@vis.gl/react-google-maps';
import { MapPin, Navigation, Phone, ExternalLink, Building2 } from 'lucide-react';
import firebaseConfig from '../../firebase-applet-config.json';
import ErrorBoundary from './ErrorBoundary';

interface FooterGoogleMapProps {
  address?: string;
  companyName?: string;
  phone?: string;
}

// HQ Coordinates: 1995 Woodlake Dr, Orange Park, FL 32003, USA
const HQ_COORDINATES = { lat: 30.1332, lng: -81.6854 };

function MapFallbackCard({
  address,
  companyName
}: {
  address: string;
  companyName: string;
}) {
  return (
    <div className="w-full h-full min-h-[190px] bg-slate-900 border border-slate-700 flex flex-col items-center justify-center p-6 text-center text-slate-300 space-y-2">
      <div className="p-2 bg-[#C5A02E]/20 text-[#C5A02E] border border-[#C5A02E]/40">
        <MapPin className="h-6 w-6" />
      </div>
      <div>
        <h4 className="font-serif font-bold text-sm text-white">{companyName} HQ</h4>
        <p className="text-xs text-slate-400 font-sans mt-0.5">{address}</p>
      </div>
      <a
        href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1.5 text-[11px] font-bold text-[#C5A02E] hover:underline uppercase tracking-wider pt-1"
      >
        <Navigation className="h-3 w-3" /> Open in Google Maps <ExternalLink className="h-3 w-3" />
      </a>
    </div>
  );
}

export default function FooterGoogleMap({
  address = "1995 Woodlake Dr, Orange Park, FL 32003, USA",
  companyName = "Howard Homes LLC",
  phone = "+1 (800) 555-0190"
}: FooterGoogleMapProps) {
  const [isInfoWindowOpen, setIsInfoWindowOpen] = useState(false);
  const [mapError, setMapError] = useState(false);

  useEffect(() => {
    const handleAuthOrQuotaError = () => setMapError(true);
    window.addEventListener('gmp-quota-exceeded', handleAuthOrQuotaError);
    return () => window.removeEventListener('gmp-quota-exceeded', handleAuthOrQuotaError);
  }, []);

  // Retrieve API key from environment variable, falling back to provisioned Firebase/GCP key
  const apiKey = ((import.meta as any).env?.VITE_GOOGLE_MAPS_API_KEY as string) || (firebaseConfig as any)?.apiKey || '';
  const safePhone = String(phone || '+1 (800) 555-0190');

  if (mapError || !apiKey) {
    return <MapFallbackCard address={address} companyName={companyName} />;
  }

  return (
    <ErrorBoundary fallback={<MapFallbackCard address={address} companyName={companyName} />}>
      <div className="w-full h-full min-h-[190px] relative overflow-hidden bg-slate-900 border border-slate-700 group">
        <APIProvider apiKey={apiKey} onError={() => setMapError(true)}>
          <Map
            style={{ width: '100%', height: '100%', minHeight: '190px' }}
            defaultCenter={HQ_COORDINATES}
            defaultZoom={16}
            mapId="DEMO_MAP_ID"
            internalUsageAttributionIds={["gmp_mcp_codeassist_v1_aistudio"]}
            gestureHandling="cooperative"
            disableDefaultUI={false}
            zoomControl={true}
            mapTypeControl={false}
            streetViewControl={true}
            fullscreenControl={true}
          >
            <AdvancedMarker
              position={HQ_COORDINATES}
              title={`${companyName} Headquarters`}
              onClick={() => setIsInfoWindowOpen(prev => !prev)}
            >
              <Pin
                background="#0A1D37"
                borderColor="#C5A02E"
                glyphColor="#C5A02E"
                scale={1.15}
              />
            </AdvancedMarker>

            {isInfoWindowOpen && (
              <InfoWindow
                position={HQ_COORDINATES}
                onCloseClick={() => setIsInfoWindowOpen(false)}
              >
                <div className="p-2 text-[#0A1D37] font-sans max-w-[240px] space-y-1.5">
                  <div className="flex items-center gap-1.5 border-b border-slate-200 pb-1">
                    <Building2 className="h-4 w-4 text-[#C5A02E] shrink-0" />
                    <strong className="font-serif text-xs font-bold leading-tight">{companyName}</strong>
                  </div>
                  <p className="text-[11px] text-slate-700 leading-snug flex items-start gap-1">
                    <MapPin className="h-3 w-3 text-[#C5A02E] shrink-0 mt-0.5" />
                    <span>{address}</span>
                  </p>
                  <p className="text-[11px] text-slate-700 leading-snug flex items-center gap-1">
                    <Phone className="h-3 w-3 text-[#C5A02E] shrink-0" />
                    <a href={`tel:${safePhone.replace(/\s+/g, '')}`} className="hover:underline text-slate-900 font-bold">
                      {safePhone}
                    </a>
                  </p>
                  <div className="pt-1 border-t border-slate-200 flex justify-between items-center">
                    <a
                      href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(address)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[10px] font-bold text-[#0A1D37] hover:text-[#C5A02E] flex items-center gap-1 uppercase"
                    >
                      <Navigation className="h-3 w-3 text-[#C5A02E]" /> Get Directions
                    </a>
                    <span className="text-[9px] font-mono text-emerald-700 bg-emerald-50 px-1 py-0.5 font-bold">
                      Floor 41
                    </span>
                  </div>
                </div>
              </InfoWindow>
            )}
          </Map>
        </APIProvider>

        {/* Floating map badge */}
        <div className="absolute top-2.5 left-2.5 pointer-events-none bg-[#0A1D37]/90 text-white backdrop-blur-sm px-2.5 py-1 border border-[#C5A02E]/40 shadow-md text-[10px] font-mono uppercase tracking-wider flex items-center gap-1.5 z-10">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
          <span>Corporate HQ • Headquarters</span>
        </div>
      </div>
    </ErrorBoundary>
  );
}
