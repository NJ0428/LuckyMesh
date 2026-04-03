import { json } from '@sveltejs/kit';
import { supportQueries } from '$lib/server/database.js';

// GET - FAQ 목록 조회
export async function GET({ url }) {
  try {
    const category = url.searchParams.get('category');
    const search = url.searchParams.get('search');

    let faqs;

    if (search) {
      const searchTerm = `%${search}%`;
      faqs = supportQueries.searchFaqs.all(searchTerm, searchTerm);
    } else if (category) {
      faqs = supportQueries.getFaqsByCategory.all(category);
    } else {
      faqs = supportQueries.getAllFaqs.all();
    }

    // 카테고리별로 그룹화
    const grouped = {};
    faqs.forEach(faq => {
      if (!grouped[faq.category]) {
        grouped[faq.category] = [];
      }
      grouped[faq.category].push(faq);
    });

    return json({
      success: true,
      faqs,
      grouped
    });
  } catch (error) {
    console.error('FAQ API error:', error);
    return json({
      success: false,
      error: '서버 오류가 발생했습니다.'
    }, { status: 500 });
  }
}

// POST - FAQ 생성 (관리자용)
export async function POST({ cookies, request }) {
  try {
    const sessionId = cookies.get('session');

    // TODO: 관리자 권한 확인 로직 추가 필요

    const body = await request.json();
    const { category, question, answer, order_index = 0 } = body;

    if (!category || !question || !answer) {
      return json({
        success: false,
        error: '카테고리, 질문, 답변은 필수 항목입니다.'
      }, { status: 400 });
    }

    const result = supportQueries.createFaq.run(
      category,
      question,
      answer,
      order_index
    );

    return json({
      success: true,
      faqId: result.lastInsertRowid,
      message: 'FAQ가 생성되었습니다.'
    });
  } catch (error) {
    console.error('FAQ POST API error:', error);
    return json({
      success: false,
      error: '서버 오류가 발생했습니다.'
    }, { status: 500 });
  }
}
