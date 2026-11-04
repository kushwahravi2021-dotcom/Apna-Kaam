export type Service = {
  id: string;
  name: string;
  icon: string;
  group: string;
};

export const services: Service[] = [
  { id: "plumber", name: "Plumber", icon: "🔧", group: "Home Services" },
  { id: "electrician", name: "Electrician", icon: "⚡", group: "Home Services" },
  { id: "mistri", name: "Mistri", icon: "🧱", group: "Home Services" },
  { id: "labour", name: "Labour", icon: "👷", group: "Home Services" },
  { id: "carpenter", name: "Carpenter", icon: "🪚", group: "Home Services" },
  { id: "painter", name: "Painter", icon: "🎨", group: "Home Services" },
  { id: "cleaning", name: "Cleaning", icon: "🧹", group: "Home Services" },
  { id: "tank-cleaning", name: "Tank Cleaning", icon: "🚰", group: "Home Services" },
  { id: "ac-repair", name: "AC Repair", icon: "❄️", group: "Repair" },
  { id: "cooler-repair", name: "Cooler Repair", icon: "🌀", group: "Repair" },
  { id: "fridge-repair", name: "Fridge Repair", icon: "🧊", group: "Repair" },
  { id: "washing-machine", name: "Washing Machine", icon: "🧺", group: "Repair" },
  { id: "tv-repair", name: "TV Repair", icon: "📺", group: "Repair" },
  { id: "ro-repair", name: "RO Repair", icon: "💧", group: "Repair" },
  { id: "vegetable", name: "Vegetable", icon: "🥬", group: "Daily Needs" },
  { id: "milk", name: "Milk", icon: "🥛", group: "Daily Needs" },
  { id: "water", name: "Water Delivery", icon: "🚚", group: "Daily Needs" },
  { id: "cab", name: "Cab", icon: "🚕", group: "Travel & Transport" },
  { id: "auto", name: "Auto", icon: "🛺", group: "Travel & Transport" },
  { id: "driver", name: "Driver", icon: "🚗", group: "Travel & Transport" },
  { id: "travel", name: "Travel", icon: "🚌", group: "Travel & Transport" },
  { id: "transport", name: "Transport", icon: "🚛", group: "Travel & Transport" },
];