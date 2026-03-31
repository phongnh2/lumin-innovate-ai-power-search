import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { IBlogMostViewDto, IBlogViewBodyDto } from './dtos/blog.dto';
import { IBlogView, IBlogViewModel } from './interfaces/blogView.interface';

@Injectable()
export class BlogViewService {
  constructor(
    @InjectModel('BlogView')
    private readonly blogViewModel: Model<IBlogViewModel>,
  ) {}

  public async increaseBlogView(data: IBlogViewBodyDto): Promise<IBlogView> {
    const { url, language, author } = data;
    const blogView = await this.blogViewModel.findOneAndUpdate(
      { url, language },
      {
        $set: {
          author,
        },
        $inc: {
          views: 1,
        },
      },
      { new: true },
    );
    return blogView
      ? { ...blogView.toObject(), _id: blogView._id.toHexString() }
      : null;
  }

  public async createBlogView(data: IBlogViewBodyDto): Promise<IBlogView> {
    const { url, language, author } = data;
    const blogView = await this.blogViewModel.create({
      url,
      views: 1,
      language,
      author,
    } as any);
    return { ...blogView.toObject(), _id: blogView._id.toHexString() };
  }

  public async findBlogByUrl(data: IBlogViewBodyDto): Promise<IBlogView> {
    const { url, language } = data;
    const blogView = await this.blogViewModel.findOne({ url, language });
    return blogView
      ? { ...blogView.toObject(), _id: blogView._id.toHexString() }
      : null;
  }

  public async getBlogsMostView(data: IBlogMostViewDto): Promise<IBlogView[]> {
    const {
      number,
      language,
      author,
      page,
    } = data;
    const query = author ? { language, author } : { language };
    const skip = (page - 1) * number;
    const blogViews = await this.blogViewModel
      .find(query)
      .sort({ views: -1 })
      .limit(number)
      .skip(skip);

    return blogViews.map((blogView) => ({
      ...blogView.toObject(),
      _id: blogView._id.toHexString(),
    }));
  }
}
