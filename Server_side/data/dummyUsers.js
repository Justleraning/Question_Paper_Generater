const users = [
    // Super Admin (Dean)
    {
      username: "DeanLobo",
      fullName: "Denzil Lobo",
      password: "Secure@Dean2025", // Use bcrypt in the seeding process
      role: "SuperAdmin",
    },
    // Admin (HOD)
    {
      username: "HODPranshanti",
      fullName: "B G Pranshanti",
      password: "@HOD2Admin025",
      role: "Admin",
    },
    // Teachers
    {
      username: "TeacherPooja",
      fullName: "Pooja A",
      password: "Teach@Pooja2025",
      role: "Teacher",
    },
    {
      username: "TeacherSelwyn",
      fullName: "Selwyn S",
      password: "Teach@Selwyn2025",
      role: "Teacher",
    },
  ];
  
  module.exports = users;
  