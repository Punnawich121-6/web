"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const prisma_1 = require("../generated/prisma");
const prisma = new prisma_1.PrismaClient();
async function main() {
    // Create sample admin user first (you'll need to adjust email to match your admin)
    const adminUser = await prisma.user.upsert({
        where: { email: 'admin@example.com' },
        update: {},
        create: {
            firebaseUid: 'sample-admin-uid',
            email: 'admin@example.com',
            displayName: 'System Admin',
            role: 'ADMIN'
        }
    });
    // Create sample equipment
    const sampleEquipment = [
        {
            name: 'โปรเจคเตอร์ Epson EB-X41',
            category: 'อิเล็กทรอนิกส์',
            description: 'โปรเจคเตอร์ความละเอียดสูง เหมาะสำหรับการนำเสนองาน สามารถใช้งานในห้องประชุมขนาดใหญ่ได้',
            image: 'https://www.miapartyhire.com.au/wp-content/uploads/2018/09/Projector-Screen.jpg',
            location: 'ห้อง IT-101',
            serialNumber: 'EP-2024-001',
            totalQuantity: 2,
            availableQuantity: 2,
            status: 'AVAILABLE',
            condition: 'ดี',
            specifications: {
                resolution: 'XGA (1024x768)',
                brightness: '3600 Lumens',
                connectivity: 'HDMI, VGA, USB'
            },
            createdBy: adminUser.id
        },
        {
            name: 'กล้องดิจิตอล Canon EOS 850D',
            category: 'อิเล็กทรอนิกส์',
            description: 'กล้อง DSLR สำหรับถ่ายภาพคุณภาพสูง มีเลนส์ kit 18-55mm พร้อมใช้งาน',
            image: 'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=400&h=300&fit=crop',
            location: 'ห้อง Media-202',
            serialNumber: 'CN-2024-002',
            totalQuantity: 3,
            availableQuantity: 1,
            status: 'AVAILABLE',
            condition: 'ดีมาก',
            specifications: {
                sensor: 'APS-C CMOS',
                resolution: '24.1 MP',
                video: '4K 30fps',
                lens: '18-55mm Kit Lens'
            },
            createdBy: adminUser.id
        },
        {
            name: 'ไมโครโฟนไร้สาย Shure SM58',
            category: 'เครื่องเสียง',
            description: 'ไมโครโฟนไร้สายคุณภาพดี สำหรับงานนำเสนอและการแสดง มีแบตเตอรี่สำรอง',
            image: 'https://images.unsplash.com/photo-1590602847861-f357a9332bbc?w=400&h=300&fit=crop',
            location: 'ห้อง Audio-301',
            serialNumber: 'SH-2024-003',
            totalQuantity: 10,
            availableQuantity: 8,
            status: 'AVAILABLE',
            condition: 'ดี',
            specifications: {
                type: 'Dynamic',
                pattern: 'Cardioid',
                frequency: '50Hz-15kHz',
                range: '100m'
            },
            createdBy: adminUser.id
        },
        {
            name: 'แท็บเล็ต iPad Air (5th Gen)',
            category: 'อิเล็กทรอนิกส์',
            description: 'แท็บเล็ตสำหรับการนำเสนอและงานกราฟิก มาพร้อม Apple Pencil และ Magic Keyboard',
            image: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=400&h=300&fit=crop',
            location: 'ห้อง IT-105',
            serialNumber: 'AP-2024-004',
            totalQuantity: 5,
            availableQuantity: 4,
            status: 'AVAILABLE',
            condition: 'ดีมาก',
            specifications: {
                display: '10.9-inch Liquid Retina',
                processor: 'M1 Chip',
                storage: '256GB',
                accessories: 'Apple Pencil, Magic Keyboard'
            },
            createdBy: adminUser.id
        },
        {
            name: 'เครื่องพิมพ์ 3D Ender 3 V2',
            category: 'เครื่องจักร',
            description: 'เครื่องพิมพ์ 3D สำหรับสร้างชิ้นงานต้นแบบ พร้อมฟิลาเมนต์ PLA และ ABS',
            image: 'https://images.unsplash.com/photo-1581833971358-2c8b550f87b3?w=400&h=300&fit=crop',
            location: 'ห้อง Workshop-401',
            serialNumber: 'EN-2024-005',
            totalQuantity: 2,
            availableQuantity: 2,
            status: 'AVAILABLE',
            condition: 'ดี',
            specifications: {
                'build volume': '220 x 220 x 250mm',
                'layer resolution': '0.1-0.4mm',
                filaments: 'PLA, ABS, PETG',
                connectivity: 'SD Card, USB'
            },
            createdBy: adminUser.id
        }
    ];
    // Insert sample equipment
    for (const equipment of sampleEquipment) {
        await prisma.equipment.upsert({
            where: { serialNumber: equipment.serialNumber },
            update: {},
            create: equipment
        });
    }
    console.log('Database seeded successfully!');
}
main()
    .catch((e) => {
    console.error(e);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
