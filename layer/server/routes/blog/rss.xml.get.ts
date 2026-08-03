import { defineEventHandler } from "h3";
import { defaultLocale } from "../../../i18n/locales";
import { serveBlogFeed } from "../../utils/blog-feed";

export default defineEventHandler((event) => serveBlogFeed(event, defaultLocale));
