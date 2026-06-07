require('dotenv').config();
const mongoose = require('mongoose');
const Hospital = require('../src/models/Hospital');

const hospitals = [
  { name: 'Srinagar General Hospital', address: '1 Lal Chowk, Srinagar', city: 'Srinagar', phone: '+91-194-2450000', departments: ['Emergency', 'Cardiology', 'Neurology', 'Orthopedics', 'ICU'], isVerified: true },
  { name: 'SKIMS Medical College', address: 'Soura, Srinagar', city: 'Srinagar', phone: '+91-194-2401013', departments: ['Emergency', 'Surgery', 'Oncology', 'Pediatrics', 'Radiology'], isVerified: true },
  { name: 'Bone & Joint Hospital', address: 'Barzullah, Srinagar', city: 'Srinagar', phone: '+91-194-2452500', departments: ['Orthopedics', 'Physiotherapy', 'Emergency'], isVerified: true },
  { name: 'Aga Khan Hospital', address: 'Stadium Road, Karachi', city: 'Karachi', phone: '+92-21-34864000', departments: ['Emergency', 'Cardiology', 'Oncology', 'Neurology', 'Transplant'], isVerified: true },
  { name: 'City Hospital', address: 'Model Town, Lahore', city: 'Lahore', phone: '+92-42-35761999', departments: ['Emergency', 'Surgery', 'ICU', 'Pediatrics'], isVerified: true },
  { name: 'Holy Family Hospital', address: 'Rawalpindi', city: 'Rawalpindi', phone: '+92-51-5566000', departments: ['Emergency', 'Cardiology', 'Gynecology', 'Pediatrics'], isVerified: true },
  { name: 'Indus Hospital', address: 'Korangi, Karachi', city: 'Karachi', phone: '+92-21-35112709', departments: ['Emergency', 'Cancer', 'Cardiac', 'Blood Bank'], isVerified: true },
  { name: 'Mayo Hospital', address: 'Nila Gumbad, Lahore', city: 'Lahore', phone: '+92-42-99200600', departments: ['Emergency', 'Neurology', 'Burn Unit', 'ENT', 'Eye'], isVerified: true },
];

mongoose.connect(process.env.MONGODB_URI).then(async () => {
  await Hospital.deleteMany({});
  await Hospital.insertMany(hospitals);
  console.log(`✅ Seeded ${hospitals.length} hospitals`);
  process.exit(0);
}).catch(err => { console.error(err); process.exit(1); });
