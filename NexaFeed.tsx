import React from 'react';
import { Post } from '../types';
import { Heart, MessageCircle, Share2, PlayCircle, Bookmark } from 'lucide-react';

const MOCK_POSTS: Post[] = [
  { id: '1', user: 'Rahul Verma', avatar: 'RV', title: 'How to apply for Pan Card in 5 mins', likes: 1240, comments: 45, tags: ['Tutorial', 'PanCard'], type: 'video' },
  { id: '2', user: 'Priya Sharma', avatar: 'PS', title: 'My experience with Digilocker integration on NivaranX', likes: 856, comments: 22, tags: ['Review', 'Digilocker'], type: 'article' },
  { id: '3', user: 'NivaranX Official', avatar: 'NX', title: 'New Feature Alert: Sonic AI 2.0', likes: 5000, comments: 102, tags: ['Update', 'Official'], type: 'video' },
];

const NexaFeed: React.FC = () => {
  return (
    <div className="pb-20 space-y-6">
      <div className="p-4 bg-white dark:bg-deep sticky top-0 z-10 border-b border-gray-100 dark:border-white/10">
        <h2 className="text-2xl font-black bg-clip-text text-transparent bg-gradient-to-r from-royal to-electric">NexaFeed</h2>
        <p className="text-xs text-gray-500 dark:text-gray-400">Community, Reviews & Short Learning</p>
      </div>

      <div className="px-4 space-y-6">
        {MOCK_POSTS.map((post) => (
          <div key={post.id} className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-100 dark:border-white/5 overflow-hidden">
             <div className="p-4 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                   <div className="w-10 h-10 rounded-full bg-gradient-to-br from-royal to-deep text-white flex items-center justify-center font-bold text-sm">
                      {post.avatar}
                   </div>
                   <div>
                      <h4 className="font-bold text-sm dark:text-white">{post.user}</h4>
                      <p className="text-[10px] text-gray-400">2 hours ago</p>
                   </div>
                </div>
                <button className="text-royal font-medium text-xs bg-royal/10 px-3 py-1 rounded-full">Follow</button>
             </div>

             {/* Content Area */}
             <div className="w-full aspect-video bg-gray-100 dark:bg-black relative group cursor-pointer">
                 {post.type === 'video' ? (
                     <div className="absolute inset-0 flex items-center justify-center">
                         <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                             <PlayCircle size={40} className="text-white fill-white/20" />
                         </div>
                     </div>
                 ) : (
                     <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                         <span className="text-sm">Article Preview</span>
                     </div>
                 )}
                 <img src={`https://picsum.photos/seed/${post.id}/600/400`} alt="Thumbnail" className="w-full h-full object-cover" />
             </div>

             <div className="p-4">
                 <h3 className="font-bold text-gray-800 dark:text-white mb-2">{post.title}</h3>
                 <div className="flex flex-wrap gap-2 mb-4">
                    {post.tags.map(tag => (
                        <span key={tag} className="text-[10px] bg-gray-100 dark:bg-white/10 text-gray-600 dark:text-gray-300 px-2 py-1 rounded-md">#{tag}</span>
                    ))}
                 </div>

                 <div className="flex items-center justify-between text-gray-500 dark:text-gray-400">
                     <div className="flex items-center space-x-6">
                         <button className="flex items-center space-x-1 hover:text-red-500 transition-colors">
                             <Heart size={20} />
                             <span className="text-xs font-medium">{post.likes}</span>
                         </button>
                         <button className="flex items-center space-x-1 hover:text-royal transition-colors">
                             <MessageCircle size={20} />
                             <span className="text-xs font-medium">{post.comments}</span>
                         </button>
                         <button className="hover:text-royal transition-colors">
                             <Share2 size={20} />
                         </button>
                     </div>
                     <button className="hover:text-royal transition-colors">
                         <Bookmark size={20} />
                     </button>
                 </div>
             </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default NexaFeed;