import { Component } from "inferno";
import {
  AddAdmin,
  AddModToCommunity,
  BanFromCommunity,
  BanPerson,
  BlockPerson,
  CommentId,
  CommentResponse,
  CommunityModeratorView,
  CreateComment,
  CreateCommentLike,
  CreateCommentReport,
  DeleteComment,
  DistinguishComment,
  EditComment,
  GetComments,
  Language,
  MarkCommentReplyAsRead,
  MarkPersonMentionAsRead,
  PersonView,
  PurgeComment,
  PurgePerson,
  RemoveComment,
  SaveComment,
  TransferCommunity,
} from "lemmy-js-client";
import { CommentNodeI, CommentViewType } from "../../interfaces";
import { RequestState } from "../../services/HttpService";
import { CommentNode } from "./comment-node";

interface CommentNodesProps {
  nodes: CommentNodeI[];
  moderators?: CommunityModeratorView[];
  admins?: PersonView[];
  maxCommentsShown?: number;
  noBorder?: boolean;
  noIndent?: boolean;
  viewOnly?: boolean;
  locked?: boolean;
  markable?: boolean;
  showContext?: boolean;
  showCommunity?: boolean;
  enableDownvotes?: boolean;
  viewType: CommentViewType;
  allLanguages: Language[];
  siteLanguages: number[];
  hideImages?: boolean;
  finished: Map<CommentId, boolean | undefined>;
  onSaveComment(form: SaveComment): void;
  onCommentReplyRead(form: MarkCommentReplyAsRead): void;
  onPersonMentionRead(form: MarkPersonMentionAsRead): void;
  onCreateComment(
    form: EditComment | CreateComment
  ): Promise<RequestState<CommentResponse>>;
  onEditComment(
    form: EditComment | CreateComment
  ): Promise<RequestState<CommentResponse>>;
  onCommentVote(form: CreateCommentLike): void;
  onBlockPerson(form: BlockPerson): void;
  onDeleteComment(form: DeleteComment): void;
  onRemoveComment(form: RemoveComment): void;
  onDistinguishComment(form: DistinguishComment): void;
  onAddModToCommunity(form: AddModToCommunity): void;
  onAddAdmin(form: AddAdmin): void;
  onBanPersonFromCommunity(form: BanFromCommunity): void;
  onBanPerson(form: BanPerson): void;
  onTransferCommunity(form: TransferCommunity): void;
  onFetchChildren?(form: GetComments): void;
  onCommentReport(form: CreateCommentReport): void;
  onPurgePerson(form: PurgePerson): void;
  onPurgeComment(form: PurgeComment): void;
}

export class CommentNodes extends Component<CommentNodesProps, any> {
  constructor(props: CommentNodesProps, context: any) {
    super(props, context);
  }

  render() {
    let maxComments = this.props.maxCommentsShown ?? this.props.nodes.length;

    return (
      <div className="comments">
        {this.props.nodes.slice(0, maxComments).map(node => (
          <CommentNode
            key={node.comment_view.comment.id}
            node={node}
            noBorder={this.props.noBorder}
            noIndent={this.props.noIndent}
            viewOnly={this.props.viewOnly}
            locked={this.props.locked}
            moderators={this.props.moderators}
            admins={this.props.admins}
            markable={this.props.markable}
            showContext={this.props.showContext}
            showCommunity={this.props.showCommunity}
            enableDownvotes={this.props.enableDownvotes}
            viewType={this.props.viewType}
            allLanguages={this.props.allLanguages}
            siteLanguages={this.props.siteLanguages}
            hideImages={this.props.hideImages}
            onCommentReplyRead={this.props.onCommentReplyRead}
            onPersonMentionRead={this.props.onPersonMentionRead}
            finished={this.props.finished}
            onCreateComment={this.props.onCreateComment}
            onEditComment={this.props.onEditComment}
            onCommentVote={this.props.onCommentVote}
            onBlockPerson={this.props.onBlockPerson}
            onSaveComment={this.props.onSaveComment}
            onDeleteComment={this.props.onDeleteComment}
            onRemoveComment={this.props.onRemoveComment}
            onDistinguishComment={this.props.onDistinguishComment}
            onAddModToCommunity={this.props.onAddModToCommunity}
            onAddAdmin={this.props.onAddAdmin}
            onBanPersonFromCommunity={this.props.onBanPersonFromCommunity}
            onBanPerson={this.props.onBanPerson}
            onTransferCommunity={this.props.onTransferCommunity}
            onFetchChildren={this.props.onFetchChildren}
            onCommentReport={this.props.onCommentReport}
            onPurgePerson={this.props.onPurgePerson}
            onPurgeComment={this.props.onPurgeComment}
          />
        ))}
      </div>
    );
  }
}
