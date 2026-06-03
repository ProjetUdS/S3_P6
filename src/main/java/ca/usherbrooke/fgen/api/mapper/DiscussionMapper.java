package ca.usherbrooke.fgen.api.mapper;

import ca.usherbrooke.fgen.api.business.Discussion;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Mapper;

import java.util.List;

@Mapper
public interface DiscussionMapper {

    List<Discussion> select(
            @Param("cip") List<String> usersId,
            @Param("equipeId") String equipeId,
            @Param("discussionId") String discussionId);

    Discussion selectOne(@Param("discussionId") String discussionId);

    void deleteOne(@Param("discussionId") String discussionId);

    void insertDiscussion(@Param("discussion") Discussion discussion);

    String getNewId();
}
