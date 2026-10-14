import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { routeApi } from '../services/api.ts';
import { IRouteComparison } from '../types.ts';
import { SafetyMap } from '../components/SafetyMap.tsx';
import { INDIAN_CITY_NAMES } from '../../shared/indianCities.ts';
import {
  Route,
  Navigation,
  MapPin,
  Sparkles,
  AlertTriangle,
  Info,
  Loader2,
  Hotel,
  Clock3,
  ShieldAlert,
  CarFront,
  UtensilsCrossed,
  Coins,
  Camera,
  Landmark,
  Star,
  ArrowRight
} from 'lucide-react';

import { DESTINATION_PROFILES as areaProfiles, DestinationProfile as AreaProfile, RiskLevel } from '../data/destinationProfiles.ts';


const riskClasses: Record<RiskLevel, string> = {
  LOW: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30',
  MODERATE: 'bg-amber-500/10 text-amber-300 border-amber-500/30',
  HIGH: 'bg-rose-500/10 text-rose-300 border-rose-500/30'
};

const defaultArea = () => {
  const cityName = 'Delhi';
  return areaProfiles.find((area) => area.city.toLowerCase() === cityName.toLowerCase()) ?? areaProfiles[0];
};

export const SaferRoutesView: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [startPoint, setStartPoint] = useState(searchParams.get('start') || '');
  const [destination, setDestination] = useState(searchParams.get('dest') || 'Delhi');
  const [loading, setLoading] = useState(false);
  const [comparison, setComparison] = useState<IRouteComparison | null>(null);
  const [selectedRouteId, setSelectedRouteId] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [selectedAreaId, setSelectedAreaId] = useState<string>(defaultArea().id);

  const calculateRoutes = async (start: string, dest: string) => {
    if (!dest.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const data = await routeApi.getSafeRoute({
        startPoint: start.trim(),
        destination: dest.trim(),
        travelMode: 'Driving / Cab'
      });
      setComparison(data);
      setSelectedRouteId(data.routes[0]?.id || '');

      const matchedArea = areaProfiles.find((area) => {
        const target = `${area.name} ${area.city}`.toLowerCase();
        return dest.toLowerCase().includes(target) || target.includes(dest.toLowerCase());
      });

      if (matchedArea) {
        setSelectedAreaId(matchedArea.id);
      }
    } catch (e: any) {
      setError(e.response?.data?.error || 'Could not calculate road routes. Please check the addresses and retry.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    calculateRoutes(startPoint, destination);
  };

  const selectedRoute = comparison?.routes.find((r) => r.id === selectedRouteId) || comparison?.routes[0];
  const selectedArea = areaProfiles.find((area) => area.id === selectedAreaId) || defaultArea();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-white flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-teal-500/10 text-teal-400 border border-teal-500/20">
            <Route className="w-5 h-5" />
          </div>
          <span>Road & Area Travel Planner</span>
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Compare safe routes and explore area-wise hotels, food, attractions, expense estimates, and hotspot risk before you travel.
        </p>
      </div>

      <div className="bg-slate-800/90 rounded-3xl p-6 border border-slate-700/80 shadow-xl">
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
          <datalist id="indian-city-suggestions">
            {INDIAN_CITY_NAMES.map((city) => <option key={city} value={city} />)}
          </datalist>
          <div className="md:col-span-5">
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Starting address or landmark *
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Navigation className="w-4 h-4 text-cyan-400" />
              </div>
              <input
                type="text"
                required
                value={startPoint}
                onChange={(e) => setStartPoint(e.target.value)}
                list="indian-city-suggestions"
                maxLength={200}
                placeholder="e.g. Ghaziabad Railway Station, Ghaziabad"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-slate-100 text-xs sm:text-sm focus:outline-none focus:border-teal-500"
              />
            </div>
          </div>

          <div className="md:col-span-5">
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Destination address, landmark, or city *
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <MapPin className="w-4 h-4 text-teal-400" />
              </div>
              <input
                type="text"
                required
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                list="indian-city-suggestions"
                maxLength={200}
                placeholder="e.g. Connaught Place, Delhi"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-slate-100 text-xs sm:text-sm focus:outline-none focus:border-teal-500"
              />
            </div>
          </div>

          <div className="md:col-span-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 rounded-xl font-bold text-xs sm:text-sm bg-teal-500 hover:bg-teal-400 text-slate-950 shadow-md shadow-teal-500/20 transition-all flex items-center justify-center gap-1.5 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Computing...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Find Routes</span>
                </>
              )}
            </button>
          </div>
        </form>
        <p className="mt-4 text-[11px] text-slate-500">
          Driving routes are geocoded and routed using public OpenStreetMap services. Enter precise addresses for precise endpoints.
          <a className="ml-1 font-semibold underline" href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">OpenStreetMap attribution</a>
        </p>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <section className="bg-slate-800/90 rounded-3xl p-6 border border-slate-700/80 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 border-b border-slate-700/60 mb-6">
          <div>
            <h3 className="text-base font-bold text-white">Area-wise travel explorer</h3>
            <p className="text-xs text-slate-400 mt-1">Select an area to instantly view its risk hotspot, travel spend, local food, and best stay options.</p>
          </div>
          <span className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-[11px] font-semibold ${riskClasses[selectedArea.riskLevel]}`}>
            <ShieldAlert className="w-3.5 h-3.5" />
            Risk {selectedArea.riskLevel} · {selectedArea.riskScore}/100
          </span>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-[260px_minmax(0,1fr)] gap-6">
          <div className="space-y-3">
            {areaProfiles.map((area) => {
              const isSelected = area.id === selectedArea.id;
              return (
                <button
                  key={area.id}
                  type="button"
                  onClick={() => setSelectedAreaId(area.id)}
                  className={`w-full text-left rounded-2xl border p-3 transition-all ${
                    isSelected
                      ? 'bg-teal-500/10 border-teal-500/40 shadow-lg shadow-teal-500/10'
                      : 'bg-slate-900/70 border-slate-700 hover:border-slate-500'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div>
                      <p className="text-sm font-semibold text-white">{area.name}</p>
                      <p className="text-[11px] text-slate-400">{area.city}</p>
                    </div>
                    <span className={`rounded-full border px-2 py-0.5 text-[10px] font-bold ${riskClasses[area.riskLevel]}`}>
                      {area.riskLevel}
                    </span>
                  </div>
                  <p className="mt-2 text-[11px] text-slate-300">{area.category}</p>
                </button>
              );
            })}
          </div>

          <div className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="overflow-hidden rounded-2xl border border-slate-700 bg-slate-900">
                <img src={selectedArea.image} alt={selectedArea.name} className="h-56 w-full object-cover" />
              </div>
              <div className="overflow-hidden rounded-2xl border border-slate-700 bg-slate-900">
                <img src={selectedArea.oldGlimpse} alt={`${selectedArea.name} old glimpse`} className="h-56 w-full object-cover" />
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="rounded-2xl border border-slate-700 bg-slate-900/80 p-3">
                <div className="flex items-center gap-2 text-teal-300"><ShieldAlert className="w-4 h-4" /> <span className="text-[11px] uppercase tracking-wide">Risk</span></div>
                <p className="mt-2 text-lg font-bold text-white">{selectedArea.riskScore}/100</p>
                <p className="text-[11px] text-slate-400">Hotspot check</p>
              </div>
              <div className="rounded-2xl border border-slate-700 bg-slate-900/80 p-3">
                <div className="flex items-center gap-2 text-amber-300"><Coins className="w-4 h-4" /> <span className="text-[11px] uppercase tracking-wide">Budget</span></div>
                <p className="mt-2 text-sm font-bold text-white">{selectedArea.totalExpense}</p>
                <p className="text-[11px] text-slate-400">Approx. daily spend</p>
              </div>
              <div className="rounded-2xl border border-slate-700 bg-slate-900/80 p-3">
                <div className="flex items-center gap-2 text-cyan-300"><Clock3 className="w-4 h-4" /> <span className="text-[11px] uppercase tracking-wide">Best time</span></div>
                <p className="mt-2 text-sm font-bold text-white">{selectedArea.visitWindow}</p>
                <p className="text-[11px] text-slate-400">{selectedArea.visitTime}</p>
              </div>
              <div className="rounded-2xl border border-slate-700 bg-slate-900/80 p-3">
                <div className="flex items-center gap-2 text-fuchsia-300"><UtensilsCrossed className="w-4 h-4" /> <span className="text-[11px] uppercase tracking-wide">Food</span></div>
                <p className="mt-2 text-sm font-bold text-white">{selectedArea.food.length} picks</p>
                <p className="text-[11px] text-slate-400">Street + classic dining</p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              <div className="rounded-2xl border border-slate-700 bg-slate-900/80 p-4">
                <div className="flex items-center gap-2 text-amber-300 mb-3">
                  <AlertTriangle className="w-4 h-4" />
                  <span className="text-sm font-semibold text-white">Risk hotspot</span>
                </div>
                <p className="text-sm text-slate-300 leading-6">{selectedArea.riskHotspot}</p>
              </div>

              <div className="rounded-2xl border border-slate-700 bg-slate-900/80 p-4">
                <div className="flex items-center gap-2 text-cyan-300 mb-3">
                  <CarFront className="w-4 h-4" />
                  <span className="text-sm font-semibold text-white">Vehicle facility</span>
                </div>
                <div className="space-y-2.5">
                  {selectedArea.vehicleOptions.map((option) => (
                    <div key={option.type} className="rounded-xl bg-slate-800/80 border border-slate-700 p-2.5">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-semibold text-slate-200">{option.type}</span>
                        <span className="text-[11px] text-teal-300">{option.fare}</span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-1">{option.note}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              <div className="rounded-2xl border border-slate-700 bg-slate-900/80 p-4">
                <div className="flex items-center gap-2 text-emerald-300 mb-3">
                  <MapPin className="w-4 h-4" />
                  <span className="text-sm font-semibold text-white">Area-wise food</span>
                </div>
                <div className="space-y-2.5">
                  {selectedArea.food.map((item) => (
                    <div key={item.dish} className="flex items-start justify-between gap-3 rounded-xl border border-slate-700 bg-slate-800/80 p-2.5">
                      <div>
                        <p className="text-xs font-semibold text-slate-200">{item.dish}</p>
                        <p className="text-[11px] text-slate-400 mt-0.5">{item.note}</p>
                      </div>
                      <span className="text-[11px] font-semibold text-teal-300">{item.price}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-2xl border border-slate-700 bg-slate-900/80 p-4">
                <div className="flex items-center gap-2 text-violet-300 mb-3">
                  <Coins className="w-4 h-4" />
                  <span className="text-sm font-semibold text-white">Expense estimate</span>
                </div>
                <div className="space-y-2.5">
                  {selectedArea.expenses.map((expense) => (
                    <div key={expense.label} className="flex items-center justify-between border-b border-slate-700 pb-2 last:border-none last:pb-0">
                      <div>
                        <p className="text-xs font-semibold text-slate-200">{expense.label}</p>
                        <p className="text-[11px] text-slate-400">{expense.note}</p>
                      </div>
                      <span className="text-xs font-bold text-teal-300">{expense.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-700 bg-slate-900/80 p-4">
              <div className="flex items-center gap-2 text-orange-300 mb-3">
                <Camera className="w-4 h-4" />
                <span className="text-sm font-semibold text-white">Visit suggestions</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {selectedArea.places.map((place) => (
                  <div key={place.name} className="overflow-hidden rounded-2xl border border-slate-700 bg-slate-800/80">
                    <img src={place.image} alt={place.name} className="h-40 w-full object-cover" />
                    <div className="p-3">
                      <div className="flex items-center justify-between gap-2">
                        <h4 className="text-sm font-semibold text-white">{place.name}</h4>
                        <span className="text-[10px] px-2 py-1 rounded-full bg-teal-500/10 text-teal-300 border border-teal-500/30">{place.bestSlot}</span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-1">{place.time}</p>
                      <p className="text-[11px] text-slate-300 mt-2 leading-5">{place.note}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-slate-700 bg-slate-900/80 p-4">
              <div className="flex items-center justify-between gap-2 mb-4">
                <div className="flex items-center gap-2 text-rose-300">
                  <Hotel className="w-4 h-4" />
                  <span className="text-sm font-semibold text-white">Hotel booking and stay</span>
                </div>
                <span className="text-[11px] text-slate-400">Book before peak time</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {selectedArea.hotels.map((hotel) => (
                  <div key={hotel.name} className="overflow-hidden rounded-2xl border border-slate-700 bg-slate-800/80">
                    <img src={hotel.image} alt={hotel.name} className="h-44 w-full object-cover" />
                    <div className="p-3 space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <h4 className="text-sm font-semibold text-white">{hotel.name}</h4>
                        <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-2 py-0.5 text-[10px] text-amber-300 border border-amber-500/30">
                          <Star className="w-3 h-3 fill-current" /> {hotel.rating}
                        </span>
                      </div>
                      <div className="flex items-center justify-between gap-2 text-[11px] text-slate-300">
                        <span>{hotel.distance} away</span>
                        <span className="font-semibold text-teal-300">{hotel.priceRange || hotel.price}</span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {(hotel.amenities || hotel.perks || []).map((perk) => (
                          <span key={perk} className="rounded-full border border-slate-600 bg-slate-700 px-2 py-1 text-[10px] text-slate-300">{perk}</span>
                        ))}
                      </div>
                      <a
                        href={hotel.bookingUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="mt-2 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-teal-500 px-3 py-2 text-xs font-semibold text-slate-950 hover:bg-teal-400"
                      >
                        Book this hotel <ArrowRight className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-slate-700 bg-slate-900/80 p-4">
              <div className="flex items-center gap-2 text-indigo-300 mb-3">
                <Landmark className="w-4 h-4" />
                <span className="text-sm font-semibold text-white">Travel summary</span>
              </div>
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 text-sm text-slate-300">
                <div>
                  <p className="text-slate-400 text-[11px] uppercase tracking-wide">Selected area</p>
                  <p className="mt-1 text-lg font-bold text-white">{selectedArea.name}, {selectedArea.city}</p>
                </div>
                <div className="text-left md:text-right">
                  <p className="text-slate-400 text-[11px] uppercase tracking-wide">Suggested visit</p>
                  <p className="mt-1 font-semibold text-teal-300">{selectedArea.visitWindow}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {comparison && (
        <div className="space-y-8">
          <div className="flex items-start gap-3 rounded-2xl border border-amber-300 bg-amber-50 p-4 text-xs text-amber-900">
            <Info className="mt-0.5 h-4 w-4 shrink-0" />
            <p>{comparison.safetyDisclaimer} Travel times are routing estimates and do not include live traffic.</p>
          </div>

          <div className="bg-slate-800/90 rounded-3xl p-6 border border-slate-700/80 shadow-xl overflow-hidden">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 mb-4 border-b border-slate-700/60">
              <div>
                <h3 className="text-base font-bold text-white">Available Driving Routes</h3>
                <p className="text-xs text-slate-400">
                  Distance and estimated duration come from {comparison.dataSource}.
                </p>
              </div>
              <span className="text-[11px] font-semibold text-teal-800 px-3 py-1 rounded-full bg-teal-100 border border-teal-300 self-start sm:self-auto">
                {comparison.routes.length} route option{comparison.routes.length === 1 ? '' : 's'}
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-700 text-slate-400 font-semibold uppercase tracking-wider text-[11px]">
                    <th className="py-3 px-4">Route Name</th>
                    <th className="py-3 px-4">Main Roads</th>
                    <th className="py-3 px-4 text-right">Distance</th>
                    <th className="py-3 px-4 text-right">Est. Time</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700/50">
                  {comparison.routes.map((r) => {
                    const isSelected = r.id === selectedRouteId;
                    return (
                      <tr
                        key={r.id}
                        className={`transition-colors cursor-pointer ${isSelected ? 'bg-teal-50' : 'hover:bg-slate-700/20'}`}
                        onClick={() => setSelectedRouteId(r.id)}
                      >
                        <td className="py-3.5 px-4 font-semibold text-slate-200">
                          <div className="flex items-center gap-2">
                            <span>{r.name}</span>
                            {isSelected && <span className="text-[10px] px-2 py-0.5 rounded-full bg-teal-200 text-teal-900 font-bold">Selected</span>}
                          </div>
                          <span className="text-[11px] text-slate-400 block mt-0.5">{r.tag}</span>
                        </td>
                        <td className="max-w-sm px-4 py-3.5 text-slate-300" title={r.roadNames.join(', ')}>
                          <span className="line-clamp-2">{r.roadNames.length ? r.roadNames.join(' → ') : 'Street names unavailable'}</span>
                        </td>
                        <td className="py-3.5 px-4 text-right font-mono text-slate-300">{r.distanceKm} km</td>
                        <td className="py-3.5 px-4 text-right font-mono text-slate-300">{r.durationMinutes} min</td>
                        <td className="py-3.5 px-4 text-right">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedRouteId(r.id);
                            }}
                            className={`px-3 py-1 rounded-lg text-xs font-semibold ${
                              isSelected ? 'bg-teal-500 text-slate-950' : 'bg-slate-700 text-slate-200 hover:bg-slate-600'
                            }`}
                          >
                            {isSelected ? 'Selected' : 'Show'}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            <div className="lg:col-span-8">
              <SafetyMap
                center={[comparison.mapCenter.lat, comparison.mapCenter.lng]}
                zoom={12}
                locationName={comparison.destination}
                routes={comparison.routes}
                selectedRouteId={selectedRouteId}
                onSelectRoute={(id) => setSelectedRouteId(id)}
                showLocationMarker={false}
                showSafeZones={false}
                className="h-[520px]"
              />
            </div>

            <div className="lg:col-span-4 space-y-4">
              {selectedRoute && (
                <div className="bg-slate-800/90 rounded-3xl p-6 border border-slate-700/80 shadow-xl space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-700">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Selected Route Profile</span>
                  </div>

                  <h4 className="text-base font-bold text-white">{selectedRoute.name}</h4>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Road-network route from {comparison.startPoint} to {comparison.destination}.
                  </p>

                  <div className="space-y-2.5 pt-2 text-xs">
                    <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-700/50">
                      <span className="text-[11px] text-slate-400 block mb-0.5">Distance:</span>
                      <strong className="text-slate-200">{selectedRoute.distanceKm} km</strong>
                    </div>

                    <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-700/50">
                      <span className="text-[11px] text-slate-400 block mb-0.5">Estimated driving time:</span>
                      <strong className="text-slate-200">{selectedRoute.durationMinutes} min · not live traffic</strong>
                    </div>

                    <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-700/50">
                      <span className="text-[11px] text-slate-400 block mb-0.5">Road names:</span>
                      <strong className="text-slate-200">{selectedRoute.roadNames.length ? selectedRoute.roadNames.join(' → ') : 'Street names unavailable'}</strong>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-start gap-2">
                    <Info className="w-4 h-4 shrink-0 mt-0.5" />
                    <span>Use local judgement. This route data does not include verified crime, lighting, or patrol coverage.</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
