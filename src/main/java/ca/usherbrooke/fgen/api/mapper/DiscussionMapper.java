package ca.usherbrooke.fgen.api.mapper;

import ca.usherbrooke.fgen.api.business.Discussion;
import org.apache.ibatis.annotations.Param;

import java.util.List;

public interface DiscussionMapper {

  List<Discussion> select(
      @Param("cip") List<String> users_id,
      @Param("equipeId") String equipeId,
      @Param("discussionId") String discussionId);

  Discussion selectOne(@Param("id") String id);

  void deleteOne(@Param("id") String id);

  void insertDiscussion(@Param("discussion") Discussion discussion);

  String getNewId();
}
