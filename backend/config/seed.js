// backend/config/seed.js
// Run with: npm run seed
// Creates default admin + sample doctors, patients, appointments

require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const User        = require('../models/User');
const Patient     = require('../models/Patient');
const Doctor      = require('../models/Doctor');
const Appointment = require('../models/Appointment');

const connectDB = require('./database');

const seed = async () => {
  try {
    await connectDB();
    console.log('\n🌱 Starting database seed...\n');

    // ---- Clear existing data ----
    await User.deleteMany({});
    await Patient.deleteMany({});
    await Doctor.deleteMany({});
    await Appointment.deleteMany({});
    console.log('🧹 Cleared existing data');

    // ---- Create Admin User ----
    const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';

    const admin = await User.create({
      username: process.env.ADMIN_USERNAME || 'admin',
      email: process.env.ADMIN_EMAIL || 'admin@medicare.com',
      password: adminPassword,
      role: 'admin',
      fullName: 'System Administrator',
    });
    console.log(`✅ Admin created: ${admin.username} / ${adminPassword}`);

    // ---- Create Sample Doctors ----
    const doctorsData = [
      { name: 'Dr. Sarah Kimani',  specialty: 'Cardiology',      phone: '+254701234567', email: 'sarah.kimani@medicare.com',  availability: 'Available',   experience: 12, qualifications: 'MBBS, MD (Cardiology)' },
      { name: 'Dr. James Omondi',  specialty: 'Neurology',        phone: '+254702345678', email: 'james.omondi@medicare.com',  availability: 'Available',   experience: 8,  qualifications: 'MBBS, MD (Neurology)' },
      { name: 'Dr. Amina Hassan',  specialty: 'Pediatrics',       phone: '+254703456789', email: 'amina.hassan@medicare.com',  availability: 'Available',   experience: 15, qualifications: 'MBBS, DCH' },
      { name: 'Dr. Peter Waweru',  specialty: 'Orthopedics',      phone: '+254704567890', email: 'peter.waweru@medicare.com',  availability: 'On Leave',    experience: 10, qualifications: 'MBBS, MS (Ortho)' },
      { name: 'Dr. Grace Mutua',   specialty: 'Dermatology',      phone: '+254705678901', email: 'grace.mutua@medicare.com',   availability: 'Available',   experience: 6,  qualifications: 'MBBS, MD (Dermatology)' },
      { name: 'Dr. David Mwangi',  specialty: 'General Medicine', phone: '+254706789012', email: 'david.mwangi@medicare.com',  availability: 'Available',   experience: 20, qualifications: 'MBBS, MRCGP' },
      { name: 'Dr. Fatuma Abdala', specialty: 'Gynecology',       phone: '+254707890123', email: 'fatuma.abdala@medicare.com', availability: 'Unavailable', experience: 9,  qualifications: 'MBBS, MS (Gynecology)' },
    ];

    const doctors = await Doctor.insertMany(doctorsData);
    console.log(`✅ Created ${doctors.length} doctors`);

    // ---- Create Sample Patients ----
    const patientsData = [
      { name: 'John Kamau',        age: 34, gender: 'Male',   phone: '+254711111001', email: 'john.kamau@email.com',    address: 'Nairobi, Kenya',   bloodGroup: 'A+', illness: 'Hypertension',          emergencyContact: 'Jane Kamau: +254711111011' },
      { name: 'Mary Wanjiku',      age: 28, gender: 'Female', phone: '+254711111002', email: 'mary.wanjiku@email.com',  address: 'Mombasa, Kenya',   bloodGroup: 'B+', illness: 'Diabetes Type 2',       emergencyContact: 'Peter Wanjiku: +254711111012' },
      { name: 'Ali Mohamed',       age: 45, gender: 'Male',   phone: '+254711111003', email: 'ali.mohamed@email.com',   address: 'Kisumu, Kenya',    bloodGroup: 'O+', illness: 'Malaria',               emergencyContact: 'Fatuma Mohamed: +254711111013' },
      { name: 'Fatuma Abubakar',   age: 32, gender: 'Female', phone: '+254711111004', email: 'fatuma.ab@email.com',     address: 'Nakuru, Kenya',    bloodGroup: 'AB+',illness: 'Respiratory Infection', emergencyContact: 'Hassan Abubakar: +254711111014' },
      { name: 'Samuel Otieno',     age: 52, gender: 'Male',   phone: '+254711111005', email: 'samuel.otieno@email.com', address: 'Eldoret, Kenya',   bloodGroup: 'A-', illness: 'Back Pain',             emergencyContact: 'Agnes Otieno: +254711111015' },
      { name: 'Esther Njoki',      age: 19, gender: 'Female', phone: '+254711111006', email: 'esther.njoki@email.com',  address: 'Thika, Kenya',     bloodGroup: 'O-', illness: 'Flu & Fever',           emergencyContact: 'James Njoki: +254711111016' },
      { name: 'Brian Kipchoge',    age: 41, gender: 'Male',   phone: '+254711111007', email: 'brian.kip@email.com',     address: 'Nairobi, Kenya',   bloodGroup: 'B-', illness: 'Arthritis',             emergencyContact: 'Ruth Kipchoge: +254711111017' },
      { name: 'Aisha Mombasa',     age: 36, gender: 'Female', phone: '+254711111008', email: 'aisha.m@email.com',       address: 'Mombasa, Kenya',   bloodGroup: 'A+', illness: 'Migraine',              emergencyContact: 'Omar Mombasa: +254711111018' },
    ];

    const patients = await Patient.insertMany(patientsData);
    console.log(`✅ Created ${patients.length} patients`);

    // ---- Create Sample Appointments ----
    const today = new Date();
    const tomorrow = new Date(today); tomorrow.setDate(tomorrow.getDate() + 1);
    const dayAfter = new Date(today); dayAfter.setDate(dayAfter.getDate() + 2);
    const yesterday = new Date(today); yesterday.setDate(yesterday.getDate() - 1);

    const appointmentsData = [
      { patient: patients[0]._id, doctor: doctors[0]._id, appointmentDate: tomorrow,  appointmentTime: '09:00', status: 'Pending',   notes: 'Regular blood pressure checkup' },
      { patient: patients[1]._id, doctor: doctors[2]._id, appointmentDate: dayAfter,  appointmentTime: '10:30', status: 'Pending',   notes: 'Diabetes management review' },
      { patient: patients[2]._id, doctor: doctors[5]._id, appointmentDate: today,     appointmentTime: '14:00', status: 'Completed', notes: 'Malaria treatment follow-up' },
      { patient: patients[3]._id, doctor: doctors[5]._id, appointmentDate: yesterday, appointmentTime: '11:00', status: 'Completed', notes: 'Respiratory checkup' },
      { patient: patients[4]._id, doctor: doctors[3]._id, appointmentDate: dayAfter,  appointmentTime: '15:30', status: 'Pending',   notes: 'Back pain assessment' },
      { patient: patients[5]._id, doctor: doctors[2]._id, appointmentDate: yesterday, appointmentTime: '09:30', status: 'Cancelled', notes: 'Patient cancelled' },
      { patient: patients[6]._id, doctor: doctors[4]._id, appointmentDate: tomorrow,  appointmentTime: '13:00', status: 'Pending',   notes: 'Skin condition follow-up' },
    ];

    const appointments = await Appointment.insertMany(appointmentsData);
    console.log(`✅ Created ${appointments.length} appointments`);

    console.log('\n🎉 Database seeded successfully!\n');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`   Login URL : http://localhost:${process.env.PORT || 5000}`);
    console.log(`   Username  : ${admin.username}`);
    console.log(`   Password  : ${adminPassword}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Seed error:', error);
    process.exit(1);
  }
};

seed();
