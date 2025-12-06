import { Html } from '@react-three/drei'

type ActiveModelsOverlayProps = {
    activeAssets: { uniqueId: string; asset: { id: string }; status: 'in' | 'out' }[]
}

export default function ActiveModelsOverlay({ activeAssets }: ActiveModelsOverlayProps) {
    // We want to display a unique list of active species names
    // Filter out duplicates based on asset.id
    const uniqueSpecies = Array.from(new Set(activeAssets.map(a => a.asset.id)))
        .map(id => {
            const asset = activeAssets.find(a => a.asset.id === id)
            return asset
        })
        .filter((item): item is NonNullable<typeof item> => !!item)

    return (
        <Html
            as='div'
            fullscreen
            style={{
                pointerEvents: 'none',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'flex-end',
                alignItems: 'flex-start',
                padding: '40px',
                zIndex: 10
            }}
        >
            <div style={{
                fontFamily: "'Inter', sans-serif",
                color: 'rgba(255, 255, 255, 0.8)',
                fontSize: '14px',
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px'
            }}>
                <div style={{
                    fontSize: '10px',
                    opacity: 0.5,
                    marginBottom: '8px',
                    borderBottom: '1px solid rgba(255,255,255,0.2)',
                    paddingBottom: '4px'
                }}>
                    Active Species
                </div>
                {uniqueSpecies.map((item) => (
                    <div
                        key={item.asset.id}
                        style={{
                            opacity: item.status === 'in' ? 1 : 0.3,
                            transition: 'opacity 1s ease-in-out',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px'
                        }}
                    >
                        <span style={{
                            width: '6px',
                            height: '6px',
                            borderRadius: '50%',
                            backgroundColor: item.status === 'in' ? '#4ff' : '#f44',
                            boxShadow: item.status === 'in' ? '0 0 8px #4ff' : 'none',
                            transition: 'all 0.5s ease'
                        }} />
                        {item.asset.id.replace(/_/g, ' ')}
                    </div>
                ))}
            </div>
        </Html>
    )
}
