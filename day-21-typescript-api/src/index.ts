import { apiRequest, User, Post } from './api-client';

async function main() {
  console.log('=====================================================');
  console.log('📘 Day 21: TypeScript & API Consumption Demo');
  console.log('=====================================================\n');

  console.log('⏳ 1. Gọi API lấy danh sách Users (Strongly-typed User[])...');
  const usersRes = await apiRequest<User[]>('https://jsonplaceholder.typicode.com/users?_limit=3');

  if (usersRes.error) {
    console.error('❌ Lỗi khi lấy Users:', usersRes.error);
  } else if (usersRes.data) {
    console.log(`✅ Lấy thành công ${usersRes.data.length} users:`);
    usersRes.data.forEach(user => {
      console.log(`   - [ID: ${user.id}] ${user.name} (${user.email}) - Web: ${user.website}`);
    });
  }

  console.log('\n⏳ 2. Gọi API tạo Post mới (Type-safe POST request)...');
  const newPostPayload: Omit<Post, 'id'> = {
    userId: 1,
    title: 'Học TypeScript & API Consumption với Antigravity',
    body: 'Định nghĩa kiểu dữ liệu chặt chẽ giúp bắt lỗi ngay lúc compile time.'
  };

  const createRes = await apiRequest<Post>('https://jsonplaceholder.typicode.com/posts', {
    method: 'POST',
    body: JSON.stringify(newPostPayload)
  });

  if (createRes.error) {
    console.error('❌ Lỗi khi tạo Post:', createRes.error);
  } else if (createRes.data) {
    console.log('✅ Tạo Post mới thành công (HTTP 201):');
    console.log(`   - ID: ${createRes.data.id}`);
    console.log(`   - Title: ${createRes.data.title}`);
    console.log(`   - Body: ${createRes.data.body}`);
  }

  console.log('\n⏳ 3. Kiểm thử xử lý lỗi 404 Not Found...');
  const notFoundRes = await apiRequest<Post>('https://jsonplaceholder.typicode.com/posts/999999');
  if (notFoundRes.error) {
    console.log(`✅ Đã bắt lỗi đúng cách: "${notFoundRes.error}" (Status: ${notFoundRes.status})`);
  }

  console.log('\n=====================================================');
  console.log('🎉 Hoàn thành kiểm thử TypeScript API Consumption!');
  console.log('=====================================================');
}

main();
