import { Map, Marker } from 'pigeon-maps'

interface LocationMapProps {
  lat: number
  lng: number
  onChange: (lat: number, lng: number) => void
}

export function LocationMap({ lat, lng, onChange }: LocationMapProps) {
  return (
    <Map
      center={[lat, lng]}
      zoom={14}
      height={256}
      onClick={({ latLng }) => onChange(latLng[0], latLng[1])}
    >
      <Marker
        anchor={[lat, lng]}
        color="#ff6f20"
        width={36}
      />
    </Map>
  )
}
