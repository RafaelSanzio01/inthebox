const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log('--- CLEANING UP OLD DATA ---');
    await prisma.vote.deleteMany({});
    await prisma.comment.deleteMany({});
    await prisma.review.deleteMany({});
    await prisma.user.deleteMany({
        where: {
            email: {
                endsWith: '@box.com' // Clean up previous test users
            }
        }
    });
    console.log('--- CLEANUP COMPLETED ---');

    console.log('--- START SEEDING [TEST DATA] ---');

    // 1. Create Dummy Users
    const userSeeds = [
        { name: 'Sarah Streamer', email: 'sarah.test@box.com', image: 'https://i.pravatar.cc/150?u=sarah' },
        { name: 'Marcus Moviebuff', email: 'marcus.test@box.com', image: 'https://i.pravatar.cc/150?u=marcus' },
        { name: 'Elena Editor', email: 'elena.test@box.com', image: 'https://i.pravatar.cc/150?u=elena' },
        { name: 'James Junkie', email: 'james.test@box.com', image: 'https://i.pravatar.cc/150?u=james' },
        { name: 'Chloe Cinephile', email: 'chloe.test@box.com', image: 'https://i.pravatar.cc/150?u=chloe' },
        { name: 'David Director', email: 'david.test@box.com', image: 'https://i.pravatar.cc/150?u=david' },
        { name: 'Aydin Aktör', email: 'aydin.test@box.com', image: 'https://i.pravatar.cc/150?u=aydin' },
        { name: 'Buse Box', email: 'buse.test@box.com', image: 'https://i.pravatar.cc/150?u=buse' },
        { name: 'Caner Critic', email: 'caner.test@box.com', image: 'https://i.pravatar.cc/150?u=caner' },
        { name: 'Deniz Drama', email: 'deniz.test@box.com', image: 'https://i.pravatar.cc/150?u=deniz' },
    ];

    const users = [];
    for (const u of userSeeds) {
        const user = await prisma.user.upsert({
            where: { email: u.email },
            update: {},
            create: u,
        });
        users.push(user);
        console.log(`User created: ${user.name}`);
    }

    // 2. Define Movies for context
    const movieContexts = [
        { id: 27205, title: 'Inception', poster: '/oYuLEt3RrlvIfeVja6uS7ogyvYx.jpg' },
        { id: 157336, title: 'Interstellar', poster: '/gEU2QniE6EzuH6vdfGMRoU6bi3O.jpg' },
        { id: 155, title: 'The Dark Knight', poster: '/qJ2tW6WMUDp9QWvYpdaG9H1otnK.jpg' },
        { id: 680, title: 'Pulp Fiction', poster: '/d5iIl9h9mNpmsMC9KP6T0oH0Yv2.jpg' },
        { id: 550, title: 'Fight Club', poster: '/pB8BM79vS6vMvMjnBhCHvD8p2v7.jpg' },
    ];

    // 3. Create Reviews (Posts)
    const posts = [
        {
            userId: users[0].id,
            movieId: 27205,
            title: '[TEST] Inception mind-blown!',
            content: 'I just watched Inception for the 5th time and I just noticed the spinning top detail again. Does it actually fall? This movie is a masterpiece of Box Lounge discussions! #testdata',
            rating: 10,
            movieTitle: 'Inception',
            moviePoster: '/oYuLEt3RrlvIfeVja6uS7ogyvYx.jpg',
            upvotes: 4500
        },
        {
            userId: users[1].id,
            movieId: 157336,
            title: '[TEST] Interstellar Soundtrack is everything',
            content: 'Hans Zimmer really outdid himself here. The "No Time for Caution" track during the docking scene? Pure adrenaline. What do you guys think? #boxlounge_test',
            rating: 9,
            movieTitle: 'Interstellar',
            moviePoster: '/gEU2QniE6EzuH6vdfGMRoU6bi3O.jpg',
            upvotes: 3200
        },
        {
            userId: users[2].id,
            movieId: 155,
            title: '[TEST] Ledger vs Phoenix Joker',
            content: 'Controversial opinion: Ledger is still the best Joker. The chaos he brings is unmatched. Change my mind! [Automated Test Post]',
            rating: 10,
            movieTitle: 'The Dark Knight',
            moviePoster: '/qJ2tW6WMUDp9QWvYpdaG9H1otnK.jpg',
            upvotes: 12000
        },
        {
            userId: users[3].id,
            movieId: 680,
            title: '[TEST] What is in the briefcase?',
            content: 'Is it really just a lightbulb? I want to believe it is Marcellus Wallace\'s soul. The mystery is what makes Pulp Fiction legendary. #demo',
            rating: 10,
            movieTitle: 'Pulp Fiction',
            moviePoster: '/d5iIl9h9mNpmsMC9KP6T0oH0Yv2.jpg',
            upvotes: 8900
        },
        {
            userId: users[4].id,
            movieId: 550,
            title: '[TEST] Rule #1 of Fight Club',
            content: 'You do not talk about Fight Club. Yet here I am, talking about it in the Box Lounge. The irony! Great social commentary. #test',
            rating: 9,
            movieTitle: 'Fight Club',
            moviePoster: '/pB8BM79vS6vMvMjnBhCHvD8p2v7.jpg',
            upvotes: 6700
        }
    ];

    const createdPosts = [];
    for (const p of posts) {
        const post = await prisma.review.create({ data: p });
        createdPosts.push(post);
        console.log(`Post created: ${post.title}`);
    }

    // 4. Create Comments (Conversations)
    const comments = [
        { reviewId: createdPosts[0].id, userId: users[1].id, content: 'Actually, the top wobbles! It definitely falls at the end. [Test Reply]' },
        { reviewId: createdPosts[0].id, userId: users[2].id, content: 'I think the point is it doesn\'t matter. He\'s happy with his children. #testinsight' },
        { reviewId: createdPosts[0].id, userId: users[3].id, content: 'Wait, if its a dream inside a dream, whose dream is it? #mindblown' },
        { reviewId: createdPosts[1].id, userId: users[3].id, content: 'That pipe organ hits different on a good sound system. #testreply' },
        { reviewId: createdPosts[1].id, userId: users[4].id, content: 'I listen to this while studying. 10/10 recommendation.' },
        { reviewId: createdPosts[2].id, userId: users[4].id, content: 'Phoenix was good, but Ledger had that terrifying unpredictability. I agree! #test_convo' },
        { reviewId: createdPosts[2].id, userId: users[5].id, content: 'You guys are forgetting Nicholson... just kidding, Ledger wins. [Seed Comment]' },
        { reviewId: createdPosts[2].id, userId: users[6].id, content: 'Ledger literally disappeared into the role. Legendary performance.' },
        { reviewId: createdPosts[3].id, userId: users[6].id, content: 'It\'s definitely a lightbulb for the camera, but symbolically? Yes, the soul. #testconvo' },
        { reviewId: createdPosts[4].id, userId: users[7].id, content: 'I am Jack\'s complete lack of surprise that someone broke the first rule. #box_test' },
        { reviewId: createdPosts[4].id, userId: users[8].id, content: 'Greatest plot twist in cinema history. Period.' }
    ];

    for (const c of comments) {
        await prisma.comment.create({ data: c });
        console.log(`Comment added to post: ${c.reviewId}`);
    }

    console.log('--- SEEDING COMPLETED [TEST DATA] ---');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
