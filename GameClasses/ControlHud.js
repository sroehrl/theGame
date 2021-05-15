export default function (controlElement, detail, entity){
    switch (entity) {
        case 'sun':
            controlElement.innerHTML = `
                        <h1>Dying star</h1>
                        <p>This sun is unstable. The last sun-flare destroyed your uncle's business.</p>
                        <p>You have a shield against that, but depending on the sun's intensity, it will deplete faster and faster!</p>
                        <h3>Intensity: ${detail.getIntensity().toFixed(2)}</h3>  
                        <p>Your station will have a shield indicator once a certain threshold is met. Cooling the shiled down will require water (and the right method!).</p>
                    `;
            break;
        case 'ship':
            controlElement.innerHTML = `
                    <h3>Ship ${detail.name}</h3>
                    <p>Fuel: ${detail.getFuel()}</p>
                    <p>Position: ${detail.getPosition()[0].toFixed(2)} | ${detail.getPosition()[1].toFixed(2)}</p>
                    <p>Miming efficiency: <strong>${detail.getBeamStrength()}</strong></p>
                    <h4>Cargo</h4>
                    <div class="m-1 p-3 b-2 b-primary b-rounded-2">
                        <p>Capacity: ${detail.getCapacity().toFixed(2)}</p>
                        
                    ${detail.getCargo().type ? (
                `<p>${detail.getCargo().type}:${detail.getCargo().amount}</p>`
            ) : (
                `<p>none</p>`
            )}
                    </div>
                    <h4>Activity: ${detail.activity}</h4>
                    `;
            break;
        case 'planet':

            controlElement.innerHTML = `
                    <h3>Planet</h3>
                    <p>Type: ${detail.getType()}</p>
                    <p>Coordinates: ${detail.getCoords()[0]} | ${detail.getCoords()[1]}</p>
                    <p>Pressure: ${numeral(detail.getPressure()).format('00a')}</p>
                    `;
            break;
        case 'station':
            const totalResources = detail.getStats().o3Mined + detail.getStats().waterMined + detail.getStats().ironMined;
            controlElement.innerHTML = `
                    <h3>Space Station</h3>
                    <div class="grid-6-6">
                        <p class="font-strong">FuelTank: ${numeral(detail.getFuelTank()).format('00.00a')}</p>
                        <p>Resources mined: ${numeral(totalResources).format('000.0a')}</p>
                        <p>Coordinates: ${detail.getCoords()[0]} | ${detail.getCoords()[1]}</p>
                        <h4>Resources/min: ${numeral(detail.getLevel()).format('000.00a')}</h4>
                    </div>
                    <h3>Resources</h3>
                    <div class="m-1 p-3 b-2 b-primary b-rounded-2">
                        <div class="grid-6-6">
                            <p>Water</p>
                            <p>${numeral(detail.getResources().water).format('000.0a')}</p>
                            <p>Iron</p>
                            <p>${numeral(detail.getResources().iron).format('000.0a')}</p>
                            <p>O3</p>
                            <p>${numeral(detail.getResources().o3).format('000.0a')}</p>
                        </div>
                       
                    </div>
                    <h3>Modules</h3>
                   <div class="m-1 p-3 b-2 b-primary b-rounded-2">  
                        <div class="grid-6-6">
                             <p>Beamer Modules</p><p>${detail.getModules().beamerModule}</p>
                            <p>Cargo Modules</p><p>${detail.getModules().cargoModule}</p>
                        </div>
                       
                    </div>
                    <p>Ships built: ${detail.getStats().shipsBuilt}</p>
                    `;
            break;
        default:
            controlElement.innerHTML = '';
    }
}