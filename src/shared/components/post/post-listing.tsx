import classNames from "classnames";
import { Component, linkEvent } from "inferno";
import { Link } from "inferno-router";
import {
  AddAdmin,
  AddModToCommunity,
  BanFromCommunity,
  BanPerson,
  BlockPerson,
  CommunityModeratorView,
  CreatePostLike,
  CreatePostReport,
  DeletePost,
  EditPost,
  FeaturePost,
  Language,
  LockPost,
  PersonView,
  PostView,
  PurgePerson,
  PurgePost,
  RemovePost,
  SavePost,
  TransferCommunity,
} from "lemmy-js-client";
import { getExternalHost, getHttpBase } from "../../env";
import { i18n } from "../../i18next";
import { BanType, PostFormParams, PurgeType, VoteType } from "../../interfaces";
import { UserService } from "../../services";
import { HttpService, apiWrapper } from "../../services/HttpService";
import {
  amAdmin,
  amCommunityCreator,
  amMod,
  canAdmin,
  canMod,
  canShare,
  futureDaysToUnixTime,
  hostname,
  isAdmin,
  isBanned,
  isImage,
  isMod,
  isVideo,
  mdNoImages,
  mdToHtml,
  mdToHtmlInline,
  myAuthRequired,
  newVote,
  numToSI,
  relTags,
  setupTippy,
  share,
  showScores,
} from "../../utils";
import { Icon, PurgeWarning, Spinner } from "../common/icon";
import { MomentTime } from "../common/moment-time";
import { PictrsImage } from "../common/pictrs-image";
import { CommunityLink } from "../community/community-link";
import { PersonListing } from "../person/person-listing";
import { MetadataCard } from "./metadata-card";
import { PostForm } from "./post-form";

interface PostListingState {
  showEdit: boolean;
  showRemoveDialog: boolean;
  showPurgeDialog: boolean;
  purgeReason?: string;
  purgeType?: PurgeType;
  purgeLoading: boolean;
  removeReason?: string;
  showBanDialog: boolean;
  banReason?: string;
  banExpireDays?: number;
  banType?: BanType;
  removeData?: boolean;
  showConfirmTransferSite: boolean;
  showConfirmTransferCommunity: boolean;
  imageExpanded: boolean;
  viewSource: boolean;
  showAdvanced: boolean;
  showMoreMobile: boolean;
  showBody: boolean;
  showReportDialog: boolean;
  reportReason?: string;
  upvoteLoading: boolean;
  downvoteLoading: boolean;
  reportLoading: boolean;
  blockLoading: boolean;
  lockLoading: boolean;
  deleteLoading: boolean;
  removeLoading: boolean;
  saveLoading: boolean;
  featureCommunityLoading: boolean;
  featureLocalLoading: boolean;
  banLoading: boolean;
  addModLoading: boolean;
  addAdminLoading: boolean;
  transferLoading: boolean;
}

interface PostListingProps {
  post_view: PostView;
  crossPosts?: PostView[];
  moderators?: CommunityModeratorView[];
  admins?: PersonView[];
  allLanguages: Language[];
  siteLanguages: number[];
  showCommunity?: boolean;
  showBody?: boolean;
  hideImage?: boolean;
  enableDownvotes?: boolean;
  enableNsfw?: boolean;
  viewOnly?: boolean;
  onPostVote(form: CreatePostLike): void;
  onPostReport(form: CreatePostReport): void;
  onBlockPerson(form: BlockPerson): void;
  onLockPost(form: LockPost): void;
  onDeletePost(form: DeletePost): void;
  onRemovePost(form: RemovePost): void;
  onSavePost(form: SavePost): void;
  onFeaturePost(form: FeaturePost): void;
  onPurgePerson(form: PurgePerson): void;
  onPurgePost(form: PurgePost): void;
  onBanPersonFromCommunity(form: BanFromCommunity): void;
  onBanPerson(form: BanPerson): void;
  onAddModToCommunity(form: AddModToCommunity): void;
  onAddAdmin(form: AddAdmin): void;
  onTransferCommunity(form: TransferCommunity): void;
}

export class PostListing extends Component<PostListingProps, PostListingState> {
  state: PostListingState = {
    showEdit: false,
    showRemoveDialog: false,
    showPurgeDialog: false,
    purgeType: PurgeType.Person,
    showBanDialog: false,
    banType: BanType.Community,
    removeData: false,
    showConfirmTransferSite: false,
    showConfirmTransferCommunity: false,
    imageExpanded: false,
    viewSource: false,
    showAdvanced: false,
    showMoreMobile: false,
    showBody: false,
    showReportDialog: false,
    upvoteLoading: false,
    downvoteLoading: false,
    purgeLoading: false,
    reportLoading: false,
    blockLoading: false,
    lockLoading: false,
    deleteLoading: false,
    removeLoading: false,
    saveLoading: false,
    featureCommunityLoading: false,
    featureLocalLoading: false,
    banLoading: false,
    addModLoading: false,
    addAdminLoading: false,
    transferLoading: false,
  };

  constructor(props: any, context: any) {
    super(props, context);

    this.handleEditPost = this.handleEditPost.bind(this);
    this.handleEditCancel = this.handleEditCancel.bind(this);
  }

  componentWillReceiveProps(nextProps: PostListingProps) {
    if (this.props !== nextProps) {
      this.setState({
        upvoteLoading: false,
        downvoteLoading: false,
        purgeLoading: false,
        reportLoading: false,
        blockLoading: false,
        lockLoading: false,
        deleteLoading: false,
        removeLoading: false,
        saveLoading: false,
        featureCommunityLoading: false,
        featureLocalLoading: false,
        banLoading: false,
        addModLoading: false,
        addAdminLoading: false,
        transferLoading: false,
        imageExpanded: false,
      });
    }
  }

  get postView(): PostView {
    return this.props.post_view;
  }

  render() {
    const post = this.postView.post;

    return (
      <div className="post-listing">
        {!this.state.showEdit ? (
          <>
            {this.listing()}
            {this.state.imageExpanded && !this.props.hideImage && this.img}
            {post.url && this.state.showBody && post.embed_title && (
              <MetadataCard post={post} />
            )}
            {this.showBody && this.body()}
          </>
        ) : (
          <PostForm
            post_view={this.postView}
            crossPosts={this.props.crossPosts}
            onEdit={this.handleEditPost}
            onCancel={this.handleEditCancel}
            enableNsfw={this.props.enableNsfw}
            enableDownvotes={this.props.enableDownvotes}
            allLanguages={this.props.allLanguages}
            siteLanguages={this.props.siteLanguages}
          />
        )}
      </div>
    );
  }

  body() {
    let body = this.postView.post.body;
    return body ? (
      <div className="col-12 card my-2 p-2">
        {this.state.viewSource ? (
          <pre>{body}</pre>
        ) : (
          <div className="md-div" dangerouslySetInnerHTML={mdToHtml(body)} />
        )}
      </div>
    ) : (
      <></>
    );
  }

  get img() {
    return this.imageSrc ? (
      <>
        <div className="offset-sm-3 my-2 d-none d-sm-block">
          <a href={this.imageSrc} className="d-inline-block">
            <PictrsImage src={this.imageSrc} />
          </a>
        </div>
        <div className="my-2 d-block d-sm-none">
          <a
            className="d-inline-block"
            onClick={linkEvent(this, this.handleImageExpandClick)}
          >
            <PictrsImage src={this.imageSrc} />
          </a>
        </div>
      </>
    ) : (
      <></>
    );
  }

  imgThumb(src: string) {
    let post_view = this.postView;
    return (
      <PictrsImage
        src={src}
        thumbnail
        alt=""
        nsfw={post_view.post.nsfw || post_view.community.nsfw}
      />
    );
  }

  get imageSrc(): string | undefined {
    let post = this.postView.post;
    let url = post.url;
    let thumbnail = post.thumbnail_url;

    if (url && isImage(url)) {
      if (url.includes("pictrs")) {
        return url;
      } else if (thumbnail) {
        return thumbnail;
      } else {
        return url;
      }
    } else if (thumbnail) {
      return thumbnail;
    } else {
      return undefined;
    }
  }

  thumbnail() {
    let post = this.postView.post;
    let url = post.url;
    let thumbnail = post.thumbnail_url;

    if (!this.props.hideImage && url && isImage(url) && this.imageSrc) {
      return (
        <a
          href={this.imageSrc}
          className="text-body d-inline-block position-relative mb-2"
          data-tippy-content={i18n.t("expand_here")}
          onClick={linkEvent(this, this.handleImageExpandClick)}
          aria-label={i18n.t("expand_here")}
        >
          {this.imgThumb(this.imageSrc)}
          <Icon icon="image" classes="mini-overlay" />
        </a>
      );
    } else if (!this.props.hideImage && url && thumbnail && this.imageSrc) {
      return (
        <a
          className="text-body d-inline-block position-relative mb-2"
          href={url}
          rel={relTags}
          title={url}
        >
          {this.imgThumb(this.imageSrc)}
          <Icon icon="external-link" classes="mini-overlay" />
        </a>
      );
    } else if (url) {
      if (!this.props.hideImage && isVideo(url)) {
        return (
          <div className="embed-responsive embed-responsive-16by9">
            <video
              playsInline
              muted
              loop
              controls
              className="embed-responsive-item"
            >
              <source src={url} type="video/mp4" />
            </video>
          </div>
        );
      } else {
        return (
          <a className="text-body" href={url} title={url} rel={relTags}>
            <div className="thumbnail rounded bg-light d-flex justify-content-center">
              <Icon icon="external-link" classes="d-flex align-items-center" />
            </div>
          </a>
        );
      }
    } else {
      return (
        <Link
          className="text-body"
          to={`/post/${post.id}`}
          title={i18n.t("comments")}
        >
          <div className="thumbnail rounded bg-light d-flex justify-content-center">
            <Icon icon="message-square" classes="d-flex align-items-center" />
          </div>
        </Link>
      );
    }
  }

  createdLine() {
    let post_view = this.postView;
    let url = post_view.post.url;
    let body = post_view.post.body;
    return (
      <ul className="list-inline mb-1 text-muted small">
        <li className="list-inline-item">
          <PersonListing person={post_view.creator} />

          {this.creatorIsMod_ && (
            <span className="mx-1 badge">{i18n.t("mod")}</span>
          )}
          {this.creatorIsAdmin_ && (
            <span className="mx-1 badge">{i18n.t("admin")}</span>
          )}
          {post_view.creator.bot_account && (
            <span className="mx-1 badge">
              {i18n.t("bot_account").toLowerCase()}
            </span>
          )}
          {this.props.showCommunity && (
            <span>
              <span className="mx-1"> {i18n.t("to")} </span>
              <CommunityLink community={post_view.community} />
            </span>
          )}
        </li>
        {post_view.post.language_id !== 0 && (
          <span className="mx-1 badge">
            {
              this.props.allLanguages.find(
                lang => lang.id === post_view.post.language_id
              )?.name
            }
          </span>
        )}
        <li className="list-inline-item">•</li>
        {url && !(hostname(url) === getExternalHost()) && (
          <>
            <li className="list-inline-item">
              <a
                className="text-muted font-italic"
                href={url}
                title={url}
                rel={relTags}
              >
                {hostname(url)}
              </a>
            </li>
            <li className="list-inline-item">•</li>
          </>
        )}
        <li className="list-inline-item">
          <span>
            <MomentTime
              published={post_view.post.published}
              updated={post_view.post.updated}
            />
          </span>
        </li>
        {body && (
          <>
            <li className="list-inline-item">•</li>
            <li className="list-inline-item">
              <button
                className="text-muted btn btn-sm btn-link p-0"
                data-tippy-content={mdNoImages.render(body)}
                data-tippy-allowHtml={true}
                onClick={linkEvent(this, this.handleShowBody)}
              >
                <Icon icon="book-open" classes="icon-inline mr-1" />
              </button>
            </li>
          </>
        )}
      </ul>
    );
  }

  voteBar() {
    return (
      <div className={`vote-bar col-1 pr-0 small text-center`}>
        <button
          className={`btn-animate btn btn-link p-0 ${
            this.postView.my_vote == 1 ? "text-info" : "text-muted"
          }`}
          onClick={linkEvent(this, this.handleUpvote)}
          data-tippy-content={i18n.t("upvote")}
          aria-label={i18n.t("upvote")}
        >
          {this.state.upvoteLoading ? (
            <Spinner />
          ) : (
            <Icon icon="arrow-up1" classes="upvote" />
          )}
        </button>
        {showScores() ? (
          <div
            className={`unselectable pointer font-weight-bold text-muted px-1`}
            data-tippy-content={this.pointsTippy}
          >
            {numToSI(this.postView.counts.score)}
          </div>
        ) : (
          <div className="p-1"></div>
        )}
        {this.props.enableDownvotes && (
          <button
            className={`btn-animate btn btn-link p-0 ${
              this.postView.my_vote == -1 ? "text-danger" : "text-muted"
            }`}
            onClick={linkEvent(this, this.handleDownvote)}
            data-tippy-content={i18n.t("downvote")}
            aria-label={i18n.t("downvote")}
          >
            {this.state.downvoteLoading ? (
              <Spinner />
            ) : (
              <Icon icon="arrow-down1" classes="downvote" />
            )}
          </button>
        )}
      </div>
    );
  }

  get postLink() {
    let post = this.postView.post;
    return (
      <Link
        className={`d-inline-block ${
          !post.featured_community && !post.featured_local
            ? "text-body"
            : "text-primary"
        }`}
        to={`/post/${post.id}`}
        title={i18n.t("comments")}
      >
        <div
          className="d-inline-block"
          dangerouslySetInnerHTML={mdToHtmlInline(post.name)}
        />
      </Link>
    );
  }

  postTitleLine() {
    let post = this.postView.post;
    let url = post.url;

    return (
      <div className="post-title overflow-hidden">
        <h5>
          {url ? (
            this.props.showBody ? (
              <a
                className={`d-inline-block ${
                  !post.featured_community && !post.featured_local
                    ? "text-body"
                    : "text-primary"
                }`}
                href={url}
                title={url}
                rel={relTags}
              >
                <div
                  className="d-inline-block"
                  dangerouslySetInnerHTML={mdToHtmlInline(post.name)}
                />
              </a>
            ) : (
              this.postLink
            )
          ) : (
            this.postLink
          )}
          {(url && isImage(url)) ||
            (post.thumbnail_url && (
              <button
                className="btn btn-link text-monospace text-muted small d-inline-block"
                data-tippy-content={i18n.t("expand_here")}
                onClick={linkEvent(this, this.handleImageExpandClick)}
              >
                <Icon
                  icon={
                    !this.state.imageExpanded ? "plus-square" : "minus-square"
                  }
                  classes="icon-inline"
                />
              </button>
            ))}
          {post.removed && (
            <small className="ml-2 text-muted font-italic">
              {i18n.t("removed")}
            </small>
          )}
          {post.deleted && (
            <small
              className="unselectable pointer ml-2 text-muted font-italic"
              data-tippy-content={i18n.t("deleted")}
            >
              <Icon icon="trash" classes="icon-inline text-danger" />
            </small>
          )}
          {post.locked && (
            <small
              className="unselectable pointer ml-2 text-muted font-italic"
              data-tippy-content={i18n.t("locked")}
            >
              <Icon icon="lock" classes="icon-inline text-danger" />
            </small>
          )}
          {post.featured_community && (
            <small
              className="unselectable pointer ml-2 text-muted font-italic"
              data-tippy-content={i18n.t("featured")}
            >
              <Icon icon="pin" classes="icon-inline text-primary" />
            </small>
          )}
          {post.featured_local && (
            <small
              className="unselectable pointer ml-2 text-muted font-italic"
              data-tippy-content={i18n.t("featured")}
            >
              <Icon icon="pin" classes="icon-inline text-secondary" />
            </small>
          )}
          {post.nsfw && (
            <small className="ml-2 text-muted font-italic">
              {i18n.t("nsfw")}
            </small>
          )}
        </h5>
      </div>
    );
  }

  duplicatesLine() {
    let dupes = this.props.crossPosts;
    return dupes && dupes.length > 0 ? (
      <ul className="list-inline mb-1 small text-muted">
        <>
          <li className="list-inline-item mr-2">{i18n.t("cross_posted_to")}</li>
          {dupes.map(pv => (
            <li key={pv.post.id} className="list-inline-item mr-2">
              <Link to={`/post/${pv.post.id}`}>
                {pv.community.local
                  ? pv.community.name
                  : `${pv.community.name}@${hostname(pv.community.actor_id)}`}
              </Link>
            </li>
          ))}
        </>
      </ul>
    ) : (
      <></>
    );
  }

  commentsLine(mobile = false) {
    let post = this.postView.post;

    return (
      <div className="d-flex justify-content-start flex-wrap text-muted font-weight-bold mb-1">
        {this.commentsButton}
        {canShare() && (
          <button
            className="btn btn-link"
            onClick={linkEvent(this, this.handleShare)}
            type="button"
          >
            <Icon icon="share" inline />
          </button>
        )}
        {!post.local && (
          <a
            className="btn btn-link btn-animate text-muted py-0"
            title={i18n.t("link")}
            href={post.ap_id}
          >
            <Icon icon="fedilink" inline />
          </a>
        )}
        {mobile && !this.props.viewOnly && this.mobileVotes}
        {UserService.Instance.myUserInfo &&
          !this.props.viewOnly &&
          this.postActions(mobile)}
      </div>
    );
  }

  postActions(mobile = false) {
    // Possible enhancement: Priority+ pattern instead of just hard coding which get hidden behind the show more button.
    // Possible enhancement: Make each button a component.
    let post_view = this.postView;
    return (
      <>
        {this.saveButton}
        {this.crossPostButton}
        {mobile && this.showMoreButton}
        {(!mobile || this.state.showAdvanced) && (
          <>
            {!this.myPost && (
              <>
                {this.reportButton}
                {this.blockButton}
              </>
            )}
            {this.myPost && (this.showBody || this.state.showAdvanced) && (
              <>
                {this.editButton}
                {this.deleteButton}
              </>
            )}
          </>
        )}
        {this.state.showAdvanced && (
          <>
            {this.showBody && post_view.post.body && this.viewSourceButton}
            {/* Any mod can do these, not limited to hierarchy*/}
            {(amMod(this.props.moderators) || amAdmin()) && (
              <>
                {this.lockButton}
                {this.featureButton}
              </>
            )}
            {(this.canMod_ || this.canAdmin_) && <>{this.modRemoveButton}</>}
          </>
        )}
        {!mobile && this.showMoreButton}
      </>
    );
  }

  get commentsButton() {
    let post_view = this.postView;
    return (
      <button className="btn btn-link text-muted py-0 pl-0">
        <Link
          className="text-muted"
          title={i18n.t("number_of_comments", {
            count: Number(post_view.counts.comments),
            formattedCount: Number(post_view.counts.comments),
          })}
          to={`/post/${post_view.post.id}?scrollToComments=true`}
        >
          <Icon icon="message-square" classes="mr-1" inline />
          <span className="mr-2">
            {i18n.t("number_of_comments", {
              count: Number(post_view.counts.comments),
              formattedCount: numToSI(post_view.counts.comments),
            })}
          </span>
          {this.unreadCount && (
            <span className="small text-warning">
              ({this.unreadCount} {i18n.t("new")})
            </span>
          )}
        </Link>
      </button>
    );
  }

  get unreadCount(): number | undefined {
    let pv = this.postView;
    return pv.unread_comments == pv.counts.comments || pv.unread_comments == 0
      ? undefined
      : pv.unread_comments;
  }

  get mobileVotes() {
    // TODO: make nicer
    let tippy = showScores() ? { "data-tippy-content": this.pointsTippy } : {};
    return (
      <>
        <div>
          <button
            className={`btn-animate btn py-0 px-1 ${
              this.postView.my_vote == 1 ? "text-info" : "text-muted"
            }`}
            {...tippy}
            onClick={linkEvent(this, this.handleUpvote)}
            aria-label={i18n.t("upvote")}
          >
            {this.state.upvoteLoading ? (
              <Spinner />
            ) : (
              <>
                <Icon icon="arrow-up1" classes="icon-inline small" />
                {showScores() && (
                  <span className="ml-2">
                    {numToSI(this.postView.counts.upvotes)}
                  </span>
                )}
              </>
            )}
          </button>
          {this.props.enableDownvotes && (
            <button
              className={`ml-2 btn-animate btn py-0 px-1 ${
                this.postView.my_vote == -1 ? "text-danger" : "text-muted"
              }`}
              onClick={linkEvent(this, this.handleDownvote)}
              {...tippy}
              aria-label={i18n.t("downvote")}
            >
              {this.state.downvoteLoading ? (
                <Spinner />
              ) : (
                <>
                  <Icon icon="arrow-down1" classes="icon-inline small" />
                  {showScores() && (
                    <span
                      className={classNames("ml-2", {
                        invisible: this.postView.counts.downvotes === 0,
                      })}
                    >
                      {numToSI(this.postView.counts.downvotes)}
                    </span>
                  )}
                </>
              )}
            </button>
          )}
        </div>
      </>
    );
  }

  get saveButton() {
    let saved = this.postView.saved;
    let label = saved ? i18n.t("unsave") : i18n.t("save");
    return (
      <button
        className="btn btn-link btn-animate text-muted py-0"
        onClick={linkEvent(this, this.handleSavePostClick)}
        data-tippy-content={label}
        aria-label={label}
      >
        {this.state.saveLoading ? (
          <Spinner />
        ) : (
          <Icon
            icon="star"
            classes={classNames({ "text-warning": saved })}
            inline
          />
        )}
      </button>
    );
  }

  get crossPostButton() {
    return (
      <Link
        className="btn btn-link btn-animate text-muted py-0"
        to={{
          /* Empty string properties are required to satisfy type*/
          pathname: "/create_post",
          state: { ...this.crossPostParams },
          hash: "",
          key: "",
          search: "",
        }}
        title={i18n.t("cross_post")}
      >
        <Icon icon="copy" inline />
      </Link>
    );
  }

  get reportButton() {
    return (
      <button
        className="btn btn-link btn-animate text-muted py-0"
        onClick={linkEvent(this, this.handleShowReportDialog)}
        data-tippy-content={i18n.t("show_report_dialog")}
        aria-label={i18n.t("show_report_dialog")}
      >
        <Icon icon="flag" inline />
      </button>
    );
  }

  get blockButton() {
    return (
      <button
        className="btn btn-link btn-animate text-muted py-0"
        onClick={linkEvent(this, this.handleBlockPersonClick)}
        data-tippy-content={i18n.t("block_user")}
        aria-label={i18n.t("block_user")}
      >
        {this.state.blockLoading ? <Spinner /> : <Icon icon="slash" inline />}
      </button>
    );
  }

  get editButton() {
    return (
      <button
        className="btn btn-link btn-animate text-muted py-0"
        onClick={linkEvent(this, this.handleEditClick)}
        data-tippy-content={i18n.t("edit")}
        aria-label={i18n.t("edit")}
      >
        <Icon icon="edit" inline />
      </button>
    );
  }

  get deleteButton() {
    let deleted = this.postView.post.deleted;
    let label = !deleted ? i18n.t("delete") : i18n.t("restore");
    return (
      <button
        className="btn btn-link btn-animate text-muted py-0"
        onClick={linkEvent(this, this.handleDeleteClick)}
        data-tippy-content={label}
        aria-label={label}
      >
        {this.state.deleteLoading ? (
          <Spinner />
        ) : (
          <Icon
            icon="trash"
            classes={classNames({ "text-danger": deleted })}
            inline
          />
        )}
      </button>
    );
  }

  get showMoreButton() {
    return (
      <button
        className="btn btn-link btn-animate text-muted py-0"
        onClick={linkEvent(this, this.handleShowAdvanced)}
        data-tippy-content={i18n.t("more")}
        aria-label={i18n.t("more")}
      >
        <Icon icon="more-vertical" inline />
      </button>
    );
  }

  get viewSourceButton() {
    return (
      <button
        className="btn btn-link btn-animate text-muted py-0"
        onClick={linkEvent(this, this.handleViewSource)}
        data-tippy-content={i18n.t("view_source")}
        aria-label={i18n.t("view_source")}
      >
        <Icon
          icon="file-text"
          classes={classNames({ "text-success": this.state.viewSource })}
          inline
        />
      </button>
    );
  }

  get lockButton() {
    let locked = this.postView.post.locked;
    let label = locked ? i18n.t("unlock") : i18n.t("lock");
    return (
      <button
        className="btn btn-link btn-animate text-muted py-0"
        onClick={linkEvent(this, this.handleModLock)}
        data-tippy-content={label}
        aria-label={label}
      >
        {this.state.lockLoading ? (
          <Spinner />
        ) : (
          <Icon
            icon="lock"
            classes={classNames({ "text-danger": locked })}
            inline
          />
        )}
      </button>
    );
  }

  get featureButton() {
    const featuredCommunity = this.postView.post.featured_community;
    const labelCommunity = featuredCommunity
      ? i18n.t("unfeature_from_community")
      : i18n.t("feature_in_community");

    const featuredLocal = this.postView.post.featured_local;
    const labelLocal = featuredLocal
      ? i18n.t("unfeature_from_local")
      : i18n.t("feature_in_local");
    return (
      <span>
        <button
          className="btn btn-link btn-animate text-muted py-0 pl-0"
          onClick={linkEvent(this, this.handleModFeaturePostCommunity)}
          data-tippy-content={labelCommunity}
          aria-label={labelCommunity}
        >
          {this.state.featureCommunityLoading ? (
            <Spinner />
          ) : (
            <span>
              <Icon
                icon="pin"
                classes={classNames({ "text-success": featuredCommunity })}
                inline
              />
              {i18n.t("community")}
            </span>
          )}
        </button>
        {amAdmin() && (
          <button
            className="btn btn-link btn-animate text-muted py-0"
            onClick={linkEvent(this, this.handleModFeaturePostLocal)}
            data-tippy-content={labelLocal}
            aria-label={labelLocal}
          >
            {this.state.featureLocalLoading ? (
              <Spinner />
            ) : (
              <span>
                <Icon
                  icon="pin"
                  classes={classNames({ "text-success": featuredLocal })}
                  inline
                />
                {i18n.t("local")}
              </span>
            )}
          </button>
        )}
      </span>
    );
  }

  get modRemoveButton() {
    let removed = this.postView.post.removed;
    return (
      <button
        className="btn btn-link btn-animate text-muted py-0"
        onClick={linkEvent(
          this,
          !removed ? this.handleModRemoveShow : this.handleModRemoveSubmit
        )}
      >
        {/* TODO: Find an icon for this. */}
        {this.state.removeLoading ? (
          <Spinner />
        ) : !removed ? (
          i18n.t("remove")
        ) : (
          i18n.t("restore")
        )}
      </button>
    );
  }

  /**
   * Mod/Admin actions to be taken against the author.
   */
  userActionsLine() {
    // TODO: make nicer
    let post_view = this.postView;
    return (
      this.state.showAdvanced && (
        <>
          {this.canMod_ && (
            <>
              {!this.creatorIsMod_ &&
                (!post_view.creator_banned_from_community ? (
                  <button
                    className="btn btn-link btn-animate text-muted py-0"
                    onClick={linkEvent(
                      this,
                      this.handleModBanFromCommunityShow
                    )}
                    aria-label={i18n.t("ban_from_community")}
                  >
                    {i18n.t("ban_from_community")}
                  </button>
                ) : (
                  <button
                    className="btn btn-link btn-animate text-muted py-0"
                    onClick={linkEvent(
                      this,
                      this.handleModBanFromCommunitySubmit
                    )}
                    aria-label={i18n.t("unban")}
                  >
                    {this.state.banLoading ? <Spinner /> : i18n.t("unban")}
                  </button>
                ))}
              {!post_view.creator_banned_from_community && (
                <button
                  className="btn btn-link btn-animate text-muted py-0"
                  onClick={linkEvent(this, this.handleAddModToCommunity)}
                  aria-label={
                    this.creatorIsMod_
                      ? i18n.t("remove_as_mod")
                      : i18n.t("appoint_as_mod")
                  }
                >
                  {this.state.addModLoading ? (
                    <Spinner />
                  ) : this.creatorIsMod_ ? (
                    i18n.t("remove_as_mod")
                  ) : (
                    i18n.t("appoint_as_mod")
                  )}
                </button>
              )}
            </>
          )}
          {/* Community creators and admins can transfer community to another mod */}
          {(amCommunityCreator(post_view.creator.id, this.props.moderators) ||
            this.canAdmin_) &&
            this.creatorIsMod_ &&
            (!this.state.showConfirmTransferCommunity ? (
              <button
                className="btn btn-link btn-animate text-muted py-0"
                onClick={linkEvent(
                  this,
                  this.handleShowConfirmTransferCommunity
                )}
                aria-label={i18n.t("transfer_community")}
              >
                {i18n.t("transfer_community")}
              </button>
            ) : (
              <>
                <button
                  className="d-inline-block mr-1 btn btn-link btn-animate text-muted py-0"
                  aria-label={i18n.t("are_you_sure")}
                >
                  {i18n.t("are_you_sure")}
                </button>
                <button
                  className="btn btn-link btn-animate text-muted py-0 d-inline-block mr-1"
                  aria-label={i18n.t("yes")}
                  onClick={linkEvent(this, this.handleTransferCommunity)}
                >
                  {this.state.transferLoading ? <Spinner /> : i18n.t("yes")}
                </button>
                <button
                  className="btn btn-link btn-animate text-muted py-0 d-inline-block"
                  onClick={linkEvent(
                    this,
                    this.handleCancelShowConfirmTransferCommunity
                  )}
                  aria-label={i18n.t("no")}
                >
                  {i18n.t("no")}
                </button>
              </>
            ))}
          {/* Admins can ban from all, and appoint other admins */}
          {this.canAdmin_ && (
            <>
              {!this.creatorIsAdmin_ && (
                <>
                  {!isBanned(post_view.creator) ? (
                    <button
                      className="btn btn-link btn-animate text-muted py-0"
                      onClick={linkEvent(this, this.handleModBanShow)}
                      aria-label={i18n.t("ban_from_site")}
                    >
                      {i18n.t("ban_from_site")}
                    </button>
                  ) : (
                    <button
                      className="btn btn-link btn-animate text-muted py-0"
                      onClick={linkEvent(this, this.handleModBanSubmit)}
                      aria-label={i18n.t("unban_from_site")}
                    >
                      {this.state.banLoading ? (
                        <Spinner />
                      ) : (
                        i18n.t("unban_from_site")
                      )}
                    </button>
                  )}
                  <button
                    className="btn btn-link btn-animate text-muted py-0"
                    onClick={linkEvent(this, this.handlePurgePersonShow)}
                    aria-label={i18n.t("purge_user")}
                  >
                    {i18n.t("purge_user")}
                  </button>
                  <button
                    className="btn btn-link btn-animate text-muted py-0"
                    onClick={linkEvent(this, this.handlePurgePostShow)}
                    aria-label={i18n.t("purge_post")}
                  >
                    {i18n.t("purge_post")}
                  </button>
                </>
              )}
              {!isBanned(post_view.creator) && post_view.creator.local && (
                <button
                  className="btn btn-link btn-animate text-muted py-0"
                  onClick={linkEvent(this, this.handleAddAdmin)}
                  aria-label={
                    this.creatorIsAdmin_
                      ? i18n.t("remove_as_admin")
                      : i18n.t("appoint_as_admin")
                  }
                >
                  {this.state.addAdminLoading ? (
                    <Spinner />
                  ) : this.creatorIsAdmin_ ? (
                    i18n.t("remove_as_admin")
                  ) : (
                    i18n.t("appoint_as_admin")
                  )}
                </button>
              )}
            </>
          )}
        </>
      )
    );
  }

  removeAndBanDialogs() {
    let post = this.postView;
    let purgeTypeText =
      this.state.purgeType == PurgeType.Post
        ? i18n.t("purge_post")
        : `${i18n.t("purge")} ${post.creator.name}`;
    return (
      <>
        {this.state.showRemoveDialog && (
          <form
            className="form-inline"
            onSubmit={linkEvent(this, this.handleModRemoveSubmit)}
          >
            <label className="sr-only" htmlFor="post-listing-remove-reason">
              {i18n.t("reason")}
            </label>
            <input
              type="text"
              id="post-listing-remove-reason"
              className="form-control mr-2"
              placeholder={i18n.t("reason")}
              value={this.state.removeReason}
              onInput={linkEvent(this, this.handleModRemoveReasonChange)}
            />
            <button
              type="submit"
              className="btn btn-secondary"
              aria-label={i18n.t("remove_post")}
            >
              {this.state.removeLoading ? <Spinner /> : i18n.t("remove_post")}
            </button>
          </form>
        )}
        {this.state.showBanDialog && (
          <form onSubmit={linkEvent(this, this.handleModBanBothSubmit)}>
            <div className="form-group row col-12">
              <label
                className="col-form-label"
                htmlFor="post-listing-ban-reason"
              >
                {i18n.t("reason")}
              </label>
              <input
                type="text"
                id="post-listing-ban-reason"
                className="form-control mr-2"
                placeholder={i18n.t("reason")}
                value={this.state.banReason}
                onInput={linkEvent(this, this.handleModBanReasonChange)}
              />
              <label className="col-form-label" htmlFor={`mod-ban-expires`}>
                {i18n.t("expires")}
              </label>
              <input
                type="number"
                id={`mod-ban-expires`}
                className="form-control mr-2"
                placeholder={i18n.t("number_of_days")}
                value={this.state.banExpireDays}
                onInput={linkEvent(this, this.handleModBanExpireDaysChange)}
              />
              <div className="form-group">
                <div className="form-check">
                  <input
                    className="form-check-input"
                    id="mod-ban-remove-data"
                    type="checkbox"
                    checked={this.state.removeData}
                    onChange={linkEvent(this, this.handleModRemoveDataChange)}
                  />
                  <label
                    className="form-check-label"
                    htmlFor="mod-ban-remove-data"
                    title={i18n.t("remove_content_more")}
                  >
                    {i18n.t("remove_content")}
                  </label>
                </div>
              </div>
            </div>
            {/* TODO hold off on expires until later */}
            {/* <div class="form-group row"> */}
            {/*   <label class="col-form-label">Expires</label> */}
            {/*   <input type="date" class="form-control mr-2" placeholder={i18n.t('expires')} value={this.state.banExpires} onInput={linkEvent(this, this.handleModBanExpiresChange)} /> */}
            {/* </div> */}
            <div className="form-group row">
              <button
                type="submit"
                className="btn btn-secondary"
                aria-label={i18n.t("ban")}
              >
                {this.state.banLoading ? (
                  <Spinner />
                ) : (
                  <span>
                    {i18n.t("ban")} {post.creator.name}
                  </span>
                )}
              </button>
            </div>
          </form>
        )}
        {this.state.showReportDialog && (
          <form
            className="form-inline"
            onSubmit={linkEvent(this, this.handleReportSubmit)}
          >
            <label className="sr-only" htmlFor="post-report-reason">
              {i18n.t("reason")}
            </label>
            <input
              type="text"
              id="post-report-reason"
              className="form-control mr-2"
              placeholder={i18n.t("reason")}
              required
              value={this.state.reportReason}
              onInput={linkEvent(this, this.handleReportReasonChange)}
            />
            <button
              type="submit"
              className="btn btn-secondary"
              aria-label={i18n.t("create_report")}
            >
              {this.state.reportLoading ? <Spinner /> : i18n.t("create_report")}
            </button>
          </form>
        )}
        {this.state.showPurgeDialog && (
          <form
            className="form-inline"
            onSubmit={linkEvent(this, this.handlePurgeSubmit)}
          >
            <PurgeWarning />
            <label className="sr-only" htmlFor="purge-reason">
              {i18n.t("reason")}
            </label>
            <input
              type="text"
              id="purge-reason"
              className="form-control mr-2"
              placeholder={i18n.t("reason")}
              value={this.state.purgeReason}
              onInput={linkEvent(this, this.handlePurgeReasonChange)}
            />
            {this.state.purgeLoading ? (
              <Spinner />
            ) : (
              <button
                type="submit"
                className="btn btn-secondary"
                aria-label={purgeTypeText}
              >
                {this.state.purgeLoading ? <Spinner /> : { purgeTypeText }}
              </button>
            )}
          </form>
        )}
      </>
    );
  }

  mobileThumbnail() {
    let post = this.postView.post;
    return post.thumbnail_url || (post.url && isImage(post.url)) ? (
      <div className="row">
        <div className={`${this.state.imageExpanded ? "col-12" : "col-8"}`}>
          {this.postTitleLine()}
        </div>
        <div className="col-4">
          {/* Post body prev or thumbnail */}
          {!this.state.imageExpanded && this.thumbnail()}
        </div>
      </div>
    ) : (
      this.postTitleLine()
    );
  }

  showMobilePreview() {
    let body = this.postView.post.body;
    return !this.showBody && body ? (
      <div className="md-div mb-1 preview-lines">{body}</div>
    ) : (
      <></>
    );
  }

  listing() {
    return (
      <>
        {/* The mobile view*/}
        <div className="d-block d-sm-none">
          <div className="row">
            <div className="col-12">
              {this.createdLine()}

              {/* If it has a thumbnail, do a right aligned thumbnail */}
              {this.mobileThumbnail()}

              {/* Show a preview of the post body */}
              {this.showMobilePreview()}

              {this.commentsLine(true)}
              {this.userActionsLine()}
              {this.duplicatesLine()}
              {this.removeAndBanDialogs()}
            </div>
          </div>
        </div>

        {/* The larger view*/}
        <div className="d-none d-sm-block">
          <div className="row">
            {!this.props.viewOnly && this.voteBar()}
            <div className="col-sm-2 pr-0">
              <div className="">{this.thumbnail()}</div>
            </div>
            <div className="col-12 col-sm-9">
              <div className="row">
                <div className="col-12">
                  {this.postTitleLine()}
                  {this.createdLine()}
                  {this.commentsLine()}
                  {this.duplicatesLine()}
                  {this.userActionsLine()}
                  {this.removeAndBanDialogs()}
                </div>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  private get myPost(): boolean {
    return (
      this.postView.creator.id ==
      UserService.Instance.myUserInfo?.local_user_view.person.id
    );
  }
  handleEditClick(i: PostListing) {
    i.setState({ showEdit: true });
  }

  handleEditCancel() {
    this.setState({ showEdit: false });
  }

  async handleEditPost(form: EditPost) {
    const res = await apiWrapper(HttpService.client.editPost(form));

    if (res.state === "success") {
      this.setState({ showEdit: false });
    }

    return res;
  }

  handleShare(i: PostListing) {
    const { name, body, id } = i.props.post_view.post;
    share({
      title: name,
      text: body?.slice(0, 50),
      url: `${getHttpBase()}/post/${id}`,
    });
  }

  handleShowReportDialog(i: PostListing) {
    i.setState({ showReportDialog: !i.state.showReportDialog });
  }

  handleReportReasonChange(i: PostListing, event: any) {
    i.setState({ reportReason: event.target.value });
  }

  handleReportSubmit(i: PostListing, event: any) {
    event.preventDefault();
    i.setState({ reportLoading: true });
    i.props.onPostReport({
      post_id: i.postView.post.id,
      reason: i.state.reportReason ?? "",
      auth: myAuthRequired(),
    });
  }

  handleBlockPersonClick(i: PostListing) {
    i.setState({ blockLoading: true });
    i.props.onBlockPerson({
      person_id: i.postView.creator.id,
      block: true,
      auth: myAuthRequired(),
    });
  }

  handleDeleteClick(i: PostListing) {
    i.setState({ deleteLoading: true });
    i.props.onDeletePost({
      post_id: i.postView.post.id,
      deleted: !i.postView.post.deleted,
      auth: myAuthRequired(),
    });
  }

  handleSavePostClick(i: PostListing) {
    i.setState({ saveLoading: true });
    i.props.onSavePost({
      post_id: i.postView.post.id,
      save: !i.postView.saved,
      auth: myAuthRequired(),
    });
  }

  get crossPostParams(): PostFormParams {
    const queryParams: PostFormParams = {};
    const { name, url } = this.postView.post;

    queryParams.name = name;

    if (url) {
      queryParams.url = url;
    }

    const crossPostBody = this.crossPostBody();
    if (crossPostBody) {
      queryParams.body = crossPostBody;
    }

    return queryParams;
  }

  crossPostBody(): string | undefined {
    let post = this.postView.post;
    let body = post.body;

    return body
      ? `${i18n.t("cross_posted_from")} ${post.ap_id}\n\n${body.replace(
          /^/gm,
          "> "
        )}`
      : undefined;
  }

  get showBody(): boolean {
    return this.props.showBody || this.state.showBody;
  }

  handleModRemoveShow(i: PostListing) {
    i.setState({
      showRemoveDialog: !i.state.showRemoveDialog,
      showBanDialog: false,
    });
  }

  handleModRemoveReasonChange(i: PostListing, event: any) {
    i.setState({ removeReason: event.target.value });
  }

  handleModRemoveDataChange(i: PostListing, event: any) {
    i.setState({ removeData: event.target.checked });
  }

  handleModRemoveSubmit(i: PostListing, event: any) {
    event.preventDefault();
    i.setState({ removeLoading: true });
    i.props.onRemovePost({
      post_id: i.postView.post.id,
      removed: !i.postView.post.removed,
      auth: myAuthRequired(),
    });
  }

  handleModLock(i: PostListing) {
    i.setState({ lockLoading: true });
    i.props.onLockPost({
      post_id: i.postView.post.id,
      locked: !i.postView.post.locked,
      auth: myAuthRequired(),
    });
  }

  handleModFeaturePostLocal(i: PostListing) {
    i.setState({ featureLocalLoading: true });
    i.props.onFeaturePost({
      post_id: i.postView.post.id,
      featured: !i.postView.post.featured_local,
      feature_type: "Local",
      auth: myAuthRequired(),
    });
  }

  handleModFeaturePostCommunity(i: PostListing) {
    i.setState({ featureCommunityLoading: true });
    i.props.onFeaturePost({
      post_id: i.postView.post.id,
      featured: !i.postView.post.featured_community,
      feature_type: "Community",
      auth: myAuthRequired(),
    });
  }

  handleModBanFromCommunityShow(i: PostListing) {
    i.setState({
      showBanDialog: true,
      banType: BanType.Community,
      showRemoveDialog: false,
    });
  }

  handleModBanShow(i: PostListing) {
    i.setState({
      showBanDialog: true,
      banType: BanType.Site,
      showRemoveDialog: false,
    });
  }

  handlePurgePersonShow(i: PostListing) {
    i.setState({
      showPurgeDialog: true,
      purgeType: PurgeType.Person,
      showRemoveDialog: false,
    });
  }

  handlePurgePostShow(i: PostListing) {
    i.setState({
      showPurgeDialog: true,
      purgeType: PurgeType.Post,
      showRemoveDialog: false,
    });
  }

  handlePurgeReasonChange(i: PostListing, event: any) {
    i.setState({ purgeReason: event.target.value });
  }

  handlePurgeSubmit(i: PostListing, event: any) {
    event.preventDefault();
    i.setState({ purgeLoading: true });
    if (i.state.purgeType == PurgeType.Person) {
      i.props.onPurgePerson({
        person_id: i.postView.creator.id,
        reason: i.state.purgeReason,
        auth: myAuthRequired(),
      });
    } else if (i.state.purgeType == PurgeType.Post) {
      i.props.onPurgePost({
        post_id: i.postView.post.id,
        reason: i.state.purgeReason,
        auth: myAuthRequired(),
      });
    }
  }

  handleModBanReasonChange(i: PostListing, event: any) {
    i.setState({ banReason: event.target.value });
  }

  handleModBanExpireDaysChange(i: PostListing, event: any) {
    i.setState({ banExpireDays: event.target.value });
  }

  handleModBanFromCommunitySubmit(i: PostListing, event: any) {
    i.setState({ banType: BanType.Community });
    i.handleModBanBothSubmit(i, event);
  }

  handleModBanSubmit(i: PostListing, event: any) {
    i.setState({ banType: BanType.Site });
    i.handleModBanBothSubmit(i, event);
  }

  handleModBanBothSubmit(i: PostListing, event: any) {
    event.preventDefault();
    i.setState({ banLoading: true });

    let ban = !i.props.post_view.creator_banned_from_community;
    // If its an unban, restore all their data
    if (ban == false) {
      i.setState({ removeData: false });
    }
    let person_id = i.props.post_view.creator.id;
    let remove_data = i.state.removeData;
    let reason = i.state.banReason;
    let expires = futureDaysToUnixTime(i.state.banExpireDays);

    if (i.state.banType == BanType.Community) {
      const community_id = i.postView.community.id;
      i.props.onBanPersonFromCommunity({
        community_id,
        person_id,
        ban,
        remove_data,
        reason,
        expires,
        auth: myAuthRequired(),
      });
    } else {
      i.props.onBanPerson({
        person_id,
        ban,
        remove_data,
        reason,
        expires,
        auth: myAuthRequired(),
      });
    }
  }

  handleAddModToCommunity(i: PostListing) {
    i.setState({ addModLoading: true });
    i.props.onAddModToCommunity({
      community_id: i.postView.community.id,
      person_id: i.postView.creator.id,
      added: !i.creatorIsMod_,
      auth: myAuthRequired(),
    });
  }

  handleAddAdmin(i: PostListing) {
    i.setState({ addAdminLoading: true });
    i.props.onAddAdmin({
      person_id: i.postView.creator.id,
      added: !i.creatorIsAdmin_,
      auth: myAuthRequired(),
    });
  }

  handleShowConfirmTransferCommunity(i: PostListing) {
    i.setState({ showConfirmTransferCommunity: true });
  }

  handleCancelShowConfirmTransferCommunity(i: PostListing) {
    i.setState({ showConfirmTransferCommunity: false });
  }

  handleTransferCommunity(i: PostListing) {
    i.setState({ transferLoading: true });
    i.props.onTransferCommunity({
      community_id: i.postView.community.id,
      person_id: i.postView.creator.id,
      auth: myAuthRequired(),
    });
  }

  handleShowConfirmTransferSite(i: PostListing) {
    i.setState({ showConfirmTransferSite: true });
  }

  handleCancelShowConfirmTransferSite(i: PostListing) {
    i.setState({ showConfirmTransferSite: false });
  }

  handleImageExpandClick(i: PostListing, event: any) {
    event.preventDefault();
    i.setState({ imageExpanded: !i.state.imageExpanded });
    setupTippy();
  }

  handleViewSource(i: PostListing) {
    i.setState({ viewSource: !i.state.viewSource });
  }

  handleShowAdvanced(i: PostListing) {
    i.setState({ showAdvanced: !i.state.showAdvanced });
    setupTippy();
  }

  handleShowMoreMobile(i: PostListing) {
    i.setState({
      showMoreMobile: !i.state.showMoreMobile,
      showAdvanced: !i.state.showAdvanced,
    });
    setupTippy();
  }

  handleShowBody(i: PostListing) {
    i.setState({ showBody: !i.state.showBody });
    setupTippy();
  }

  handleUpvote(i: PostListing) {
    i.setState({ upvoteLoading: true });
    i.props.onPostVote({
      post_id: i.postView.post.id,
      score: newVote(VoteType.Upvote, i.props.post_view.my_vote),
      auth: myAuthRequired(),
    });
  }

  handleDownvote(i: PostListing) {
    i.setState({ downvoteLoading: true });
    i.props.onPostVote({
      post_id: i.postView.post.id,
      score: newVote(VoteType.Downvote, i.props.post_view.my_vote),
      auth: myAuthRequired(),
    });
  }

  get pointsTippy(): string {
    let points = i18n.t("number_of_points", {
      count: Number(this.postView.counts.score),
      formattedCount: Number(this.postView.counts.score),
    });

    let upvotes = i18n.t("number_of_upvotes", {
      count: Number(this.postView.counts.upvotes),
      formattedCount: Number(this.postView.counts.upvotes),
    });

    let downvotes = i18n.t("number_of_downvotes", {
      count: Number(this.postView.counts.downvotes),
      formattedCount: Number(this.postView.counts.downvotes),
    });

    return `${points} • ${upvotes} • ${downvotes}`;
  }

  get canModOnSelf_(): boolean {
    return canMod(
      this.postView.creator.id,
      this.props.moderators,
      this.props.admins,
      undefined,
      true
    );
  }

  get canMod_(): boolean {
    return canMod(
      this.postView.creator.id,
      this.props.moderators,
      this.props.admins
    );
  }

  get canAdmin_(): boolean {
    return canAdmin(this.postView.creator.id, this.props.admins);
  }

  get creatorIsMod_(): boolean {
    return isMod(this.postView.creator.id, this.props.moderators);
  }

  get creatorIsAdmin_(): boolean {
    return isAdmin(this.postView.creator.id, this.props.admins);
  }
}
